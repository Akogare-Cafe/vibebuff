"""
Package Registries Scraper - Fetches package metadata from PyPI, crates.io, pkg.go.dev
"""
import os
import json
import asyncio
import httpx
from datetime import datetime
from typing import Optional


PYPI_PACKAGES = [
    "langchain",
    "llama-index",
    "openai",
    "anthropic",
    "transformers",
    "torch",
    "tensorflow",
    "fastapi",
    "django",
    "flask",
    "streamlit",
    "gradio",
    "pandas",
    "numpy",
    "scikit-learn",
    "pytest",
    "black",
    "ruff",
    "mypy",
    "pydantic",
    "sqlalchemy",
    "alembic",
    "celery",
    "redis",
    "httpx",
    "requests",
    "aiohttp",
    "typer",
    "click",
    "rich",
    "textual",
    "instructor",
    "litellm",
    "chromadb",
    "pinecone-client",
    "weaviate-client",
    "qdrant-client",
    "sentence-transformers",
    "huggingface-hub",
    "datasets",
    "accelerate",
    "bitsandbytes",
    "vllm",
    "modal",
    "replicate",
]

CRATES_PACKAGES = [
    "tokio",
    "serde",
    "reqwest",
    "axum",
    "actix-web",
    "clap",
    "tracing",
    "anyhow",
    "thiserror",
    "sqlx",
    "diesel",
    "sea-orm",
    "async-std",
    "hyper",
    "warp",
    "rocket",
    "tonic",
    "prost",
    "rustls",
    "rayon",
    "crossbeam",
    "parking_lot",
    "dashmap",
    "once_cell",
    "lazy_static",
    "regex",
    "chrono",
    "uuid",
    "rand",
    "itertools",
    "futures",
    "async-trait",
    "tower",
    "bytes",
    "log",
    "env_logger",
    "config",
    "dotenv",
]

GO_PACKAGES = [
    "github.com/gin-gonic/gin",
    "github.com/gofiber/fiber",
    "github.com/labstack/echo",
    "github.com/gorilla/mux",
    "github.com/go-chi/chi",
    "gorm.io/gorm",
    "github.com/jmoiron/sqlx",
    "github.com/redis/go-redis",
    "github.com/nats-io/nats.go",
    "github.com/spf13/cobra",
    "github.com/spf13/viper",
    "github.com/sirupsen/logrus",
    "go.uber.org/zap",
    "github.com/stretchr/testify",
    "github.com/golang-jwt/jwt",
    "golang.org/x/oauth2",
    "github.com/sashabaranov/go-openai",
    "github.com/tmc/langchaingo",
]


async def fetch_pypi_package(client: httpx.AsyncClient, package: str) -> dict:
    """Fetch package info from PyPI."""
    url = f"https://pypi.org/pypi/{package}/json"
    
    try:
        response = await client.get(url)
        response.raise_for_status()
        
        data = response.json()
        info = data.get("info", {})
        
        releases = data.get("releases", {})
        release_dates = []
        for version, files in releases.items():
            if files:
                release_dates.append({
                    "version": version,
                    "upload_time": files[0].get("upload_time"),
                })
        
        release_dates.sort(key=lambda x: x.get("upload_time", ""), reverse=True)
        
        return {
            "name": info.get("name"),
            "version": info.get("version"),
            "summary": info.get("summary"),
            "description": info.get("description", "")[:500],
            "author": info.get("author"),
            "author_email": info.get("author_email"),
            "license": info.get("license"),
            "home_page": info.get("home_page"),
            "project_url": info.get("project_url"),
            "package_url": info.get("package_url"),
            "requires_python": info.get("requires_python"),
            "keywords": info.get("keywords"),
            "classifiers": info.get("classifiers", [])[:10],
            "project_urls": info.get("project_urls", {}),
            "recent_releases": release_dates[:5],
            "total_releases": len(releases),
            "source": "pypi",
        }
    except Exception as e:
        print(f"Error fetching PyPI package {package}: {e}")
        return {"name": package, "error": str(e), "source": "pypi"}


async def fetch_crates_package(client: httpx.AsyncClient, crate: str) -> dict:
    """Fetch package info from crates.io."""
    url = f"https://crates.io/api/v1/crates/{crate}"
    
    try:
        response = await client.get(url)
        response.raise_for_status()
        
        data = response.json()
        crate_data = data.get("crate", {})
        versions = data.get("versions", [])
        
        return {
            "name": crate_data.get("name"),
            "description": crate_data.get("description"),
            "homepage": crate_data.get("homepage"),
            "repository": crate_data.get("repository"),
            "documentation": crate_data.get("documentation"),
            "downloads": crate_data.get("downloads"),
            "recent_downloads": crate_data.get("recent_downloads"),
            "max_version": crate_data.get("max_version"),
            "max_stable_version": crate_data.get("max_stable_version"),
            "created_at": crate_data.get("created_at"),
            "updated_at": crate_data.get("updated_at"),
            "keywords": crate_data.get("keywords", []),
            "categories": crate_data.get("categories", []),
            "versions_count": len(versions),
            "recent_versions": [
                {"version": v.get("num"), "created_at": v.get("created_at")}
                for v in versions[:5]
            ],
            "source": "crates",
        }
    except Exception as e:
        print(f"Error fetching crates.io package {crate}: {e}")
        return {"name": crate, "error": str(e), "source": "crates"}


async def fetch_go_package(client: httpx.AsyncClient, package: str) -> dict:
    """Fetch package info from pkg.go.dev."""
    url = f"https://pkg.go.dev/{package}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, "html.parser")
        
        title_elem = soup.select_one("h1")
        title = title_elem.get_text(strip=True) if title_elem else package
        
        desc_elem = soup.select_one(".Documentation-overview p")
        description = desc_elem.get_text(strip=True) if desc_elem else ""
        
        version_elem = soup.select_one(".DetailsHeader-version")
        version = version_elem.get_text(strip=True) if version_elem else None
        
        license_elem = soup.select_one(".DetailsHeader-license a")
        license_info = license_elem.get_text(strip=True) if license_elem else None
        
        repo_elem = soup.select_one(".DetailsHeader-infoLabelRecipient a[href*='github.com']")
        repository = repo_elem.get("href") if repo_elem else None
        
        return {
            "name": package,
            "title": title,
            "description": description[:500] if description else "",
            "version": version,
            "license": license_info,
            "repository": repository,
            "pkg_url": f"https://pkg.go.dev/{package}",
            "source": "go",
        }
    except Exception as e:
        print(f"Error fetching Go package {package}: {e}")
        return {"name": package, "error": str(e), "source": "go"}


async def scrape_package_registries() -> dict:
    """Scrape all package registries."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "pypi": {},
        "crates": {},
        "go": {},
        "all_packages": [],
    }
    
    async with httpx.AsyncClient(
        timeout=30.0,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; VibeBuff/1.0)",
            "Accept": "application/json",
        }
    ) as client:
        for package in PYPI_PACKAGES:
            print(f"  Fetching PyPI: {package}...")
            pkg_data = await fetch_pypi_package(client, package)
            results["pypi"][package] = pkg_data
            
            if "error" not in pkg_data:
                results["all_packages"].append(pkg_data)
            
            await asyncio.sleep(0.3)
        
        for crate in CRATES_PACKAGES:
            print(f"  Fetching crates.io: {crate}...")
            crate_data = await fetch_crates_package(client, crate)
            results["crates"][crate] = crate_data
            
            if "error" not in crate_data:
                results["all_packages"].append(crate_data)
            
            await asyncio.sleep(0.3)
        
        for package in GO_PACKAGES:
            print(f"  Fetching pkg.go.dev: {package}...")
            go_data = await fetch_go_package(client, package)
            results["go"][package] = go_data
            
            if "error" not in go_data:
                results["all_packages"].append(go_data)
            
            await asyncio.sleep(1)
    
    results["total_packages"] = len(results["all_packages"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping Package Registries...")
        results = await scrape_package_registries()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "package_registries.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_packages']} packages to {output_path}")
    
    asyncio.run(main())
