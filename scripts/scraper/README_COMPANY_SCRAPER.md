# Company Tech Stack Scraper

A Python script that scrapes companies and their publicly visible tech stacks from multiple sources.

## Features

- **StackShare Integration**: Scrapes company profiles and tech stacks from StackShare
- **Website Detection**: Analyzes company websites to detect technologies from HTML/headers
- **Tech Stack Categorization**: Organizes technologies into categories (frontend, backend, database, infrastructure, monitoring)
- **Pattern Matching**: Uses regex patterns to identify technologies from web content
- **Deduplication**: Automatically removes duplicate companies

## Data Sources

1. **StackShare Featured Companies**: Pre-configured list of notable tech companies
2. **StackShare Categories**: Discovers companies by category (SaaS, fintech, developer tools, etc.)
3. **Website Analysis**: Direct technology detection from company websites
4. **Tech Blog Analysis**: Extracts tech mentions from engineering blogs (optional)

## Installation

```bash
cd /Users/kavyrattana/Coding/vibebuff/scripts/scraper

# Install dependencies (if not already installed)
pip install -r requirements.txt
```

## Usage

### Run Standalone

```bash
# Run the company tech stack scraper only
python company_techstack_scraper.py
```

### Run via Main Scraper

```bash
# Run only the company scraper
python main.py --only company-stacks

# Run all scrapers including company scraper
python main.py

# Skip company scraper when running all
python main.py --skip-company-stacks
```

## Output

The scraper generates a JSON file at `data/company_tech_stacks.json` with the following structure:

```json
{
  "scraped_at": "2026-01-14T19:13:00.000000",
  "companies": [
    {
      "name": "Airbnb",
      "slug": "airbnb",
      "description": "Book unique places to stay and things to do.",
      "website": "https://www.airbnb.com",
      "tech_stack": {
        "frontend": ["React", "TypeScript", "Next.js"],
        "backend": ["Node.js", "Ruby on Rails"],
        "database": ["PostgreSQL", "Redis"],
        "infrastructure": ["AWS", "Kubernetes"],
        "monitoring": ["Datadog", "Sentry"]
      },
      "team_size": "5000+",
      "industry": "Travel",
      "source": "stackshare",
      "scraped_at": "2026-01-14T19:13:00.000000"
    }
  ],
  "total_companies": 150,
  "total_unique_companies": 145,
  "sources": {
    "stackshare": 145,
    "website_detection": 20,
    "blog_analysis": 0
  }
}
```

## Configuration

Edit `company_techstack_scraper.py` to customize:

### Featured Companies

```python
COMPANY_SOURCES = {
    "stackshare_featured": [
        "airbnb",
        "uber",
        "netflix",
        # Add more company slugs
    ]
}
```

### Tech Categories

```python
COMPANY_SOURCES = {
    "tech_categories": [
        "saas",
        "fintech",
        "developer-tools",
        # Add more categories
    ]
}
```

### Tech Stack Patterns

```python
TECH_STACK_PATTERNS = {
    "frontend": [
        r"react", r"vue\.?js", r"angular",
        # Add more patterns
    ],
    "backend": [
        r"node\.?js", r"python", r"django",
        # Add more patterns
    ]
}
```

## Rate Limiting

The scraper includes built-in delays to respect rate limits:
- 2 seconds between StackShare company requests
- 1 second between website detection requests

## Error Handling

- Failed requests are logged with error messages
- Companies with errors are excluded from final results
- Scraper continues even if individual requests fail

## Example Output Statistics

```
Company Tech Stack Scraper
============================================================
Fetching featured companies from StackShare...
  Scraping: airbnb...
  Scraping: uber...
  ...

Discovering additional companies by category...
  Fetching companies in: saas...
    Scraping: notion...
    Scraping: linear...
  ...

Enhancing with website detection...
  Analyzing website: https://www.airbnb.com
  ...

============================================================
SCRAPING COMPLETE
============================================================
Total companies scraped: 145
StackShare companies: 145
Website detections: 20

Saved to: data/company_tech_stacks.json
```

## Integration with Vibebuff

The scraper is integrated into the main scraper pipeline and can be used to populate the companies database for https://www.vibebuff.com/companies

## Notes

- Respects robots.txt and rate limits
- Uses realistic User-Agent headers
- Includes error handling and retry logic
- Deduplicates companies by name
- Categorizes technologies automatically

## Troubleshooting

**Issue**: Rate limiting errors from StackShare
**Solution**: Increase sleep delays in the scraper

**Issue**: Website detection not finding technologies
**Solution**: Add more patterns to `TECH_STACK_PATTERNS`

**Issue**: Missing companies
**Solution**: Add company slugs to `stackshare_featured` list
