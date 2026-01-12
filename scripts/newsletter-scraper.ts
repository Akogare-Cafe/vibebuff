import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

interface Tool {
  name: string;
  url: string;
  description: string;
  source: string;
  date?: string;
}

interface NewsletterIssue {
  url: string;
  date?: string;
}

class NewsletterScraper {
  private tools: Tool[] = [];

  async scrapeTLDRArchive(maxIssues: number = 50): Promise<void> {
    console.log('Fetching TLDR archive...');
    
    try {
      const archiveResponse = await fetch('https://tldr.tech/tech/archives');
      const archiveHtml = await archiveResponse.text();
      const $ = cheerio.load(archiveHtml);
      
      const issues: NewsletterIssue[] = [];
      
      // Extract issue links from the archive
      $('a[href*="/tech/"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.match(/\/tech\/\d{4}-\d{2}-\d{2}/)) {
          const fullUrl = href.startsWith('http') ? href : `https://tldr.tech${href}`;
          const dateMatch = href.match(/(\d{4}-\d{2}-\d{2})/);
          issues.push({
            url: fullUrl,
            date: dateMatch ? dateMatch[1] : undefined
          });
        }
      });
      
      // Limit to maxIssues
      const issuesToScrape = issues.slice(0, maxIssues);
      console.log(`Found ${issuesToScrape.length} TLDR issues to scrape`);
      
      // Scrape each issue
      for (let i = 0; i < issuesToScrape.length; i++) {
        const issue = issuesToScrape[i];
        console.log(`Scraping TLDR issue ${i + 1}/${issuesToScrape.length}: ${issue.url}`);
        await this.scrapeTLDRIssue(issue);
        
        // Add delay to avoid rate limiting
        if (i < issuesToScrape.length - 1) {
          await this.delay(1000);
        }
      }
    } catch (error) {
      console.error('Error scraping TLDR archive:', error);
    }
  }

  async scrapeTLDRIssue(issue: NewsletterIssue): Promise<void> {
    try {
      const response = await fetch(issue.url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Look for GitHub repos, tools, and projects
      $('a[href*="github.com"]').each((_, element) => {
        const $link = $(element);
        const url = $link.attr('href');
        const text = $link.text().trim();
        
        if (url && text && !this.isDuplicate(url)) {
          // Get context around the link
          const parent = $link.parent();
          const description = parent.text().trim() || text;
          
          this.tools.push({
            name: text,
            url: url,
            description: description.substring(0, 500),
            source: 'TLDR',
            date: issue.date
          });
        }
      });
      
      // Look for other tool mentions in Programming section
      $('h3:contains("Programming"), h3:contains("Quick Links")').each((_, header) => {
        const $header = $(header);
        const section = $header.nextUntil('h3');
        
        section.find('a').each((_, element) => {
          const $link = $(element);
          const url = $link.attr('href');
          const text = $link.text().trim();
          
          if (url && text && this.looksLikeTool(text, url) && !this.isDuplicate(url)) {
            const parent = $link.parent();
            const description = parent.text().trim() || text;
            
            this.tools.push({
              name: text,
              url: url,
              description: description.substring(0, 500),
              source: 'TLDR',
              date: issue.date
            });
          }
        });
      });
    } catch (error) {
      console.error(`Error scraping TLDR issue ${issue.url}:`, error);
    }
  }

  async scrapeReactNewsletter(maxIssues: number = 50): Promise<void> {
    console.log('Fetching React Newsletter archive...');
    
    try {
      const archiveResponse = await fetch('https://reactnewsletter.com/issues');
      const archiveHtml = await archiveResponse.text();
      const $ = cheerio.load(archiveHtml);
      
      const issues: NewsletterIssue[] = [];
      
      // Extract issue links
      $('a[href*="/issues/"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.match(/\/issues\/\d+/)) {
          const fullUrl = href.startsWith('http') ? href : `https://reactnewsletter.com${href}`;
          if (!issues.find(i => i.url === fullUrl)) {
            issues.push({ url: fullUrl });
          }
        }
      });
      
      // Limit to maxIssues
      const issuesToScrape = issues.slice(0, maxIssues);
      console.log(`Found ${issuesToScrape.length} React Newsletter issues to scrape`);
      
      // Scrape each issue
      for (let i = 0; i < issuesToScrape.length; i++) {
        const issue = issuesToScrape[i];
        console.log(`Scraping React Newsletter issue ${i + 1}/${issuesToScrape.length}: ${issue.url}`);
        await this.scrapeReactIssue(issue);
        
        // Add delay to avoid rate limiting
        if (i < issuesToScrape.length - 1) {
          await this.delay(1000);
        }
      }
    } catch (error) {
      console.error('Error scraping React Newsletter archive:', error);
    }
  }

  async scrapeReactIssue(issue: NewsletterIssue): Promise<void> {
    try {
      const response = await fetch(issue.url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Look for Projects section
      $('h2:contains("Projects"), h3:contains("Projects")').each((_, header) => {
        const $header = $(header);
        const section = $header.nextUntil('h2, h3');
        
        section.find('a').each((_, element) => {
          const $link = $(element);
          const url = $link.attr('href');
          const text = $link.text().trim();
          
          if (url && text && !this.isDuplicate(url)) {
            const parent = $link.parent();
            const description = parent.text().trim() || text;
            
            this.tools.push({
              name: text,
              url: url,
              description: description.substring(0, 500),
              source: 'React Newsletter',
              date: issue.date
            });
          }
        });
      });
      
      // Also look for GitHub repos
      $('a[href*="github.com"]').each((_, element) => {
        const $link = $(element);
        const url = $link.attr('href');
        const text = $link.text().trim();
        
        if (url && text && !this.isDuplicate(url)) {
          const parent = $link.parent();
          const description = parent.text().trim() || text;
          
          this.tools.push({
            name: text,
            url: url,
            description: description.substring(0, 500),
            source: 'React Newsletter',
            date: issue.date
          });
        }
      });
      
      // Look for npm packages and libraries
      $('a[href*="npmjs.com"], a[href*="npm.im"]').each((_, element) => {
        const $link = $(element);
        const url = $link.attr('href');
        const text = $link.text().trim();
        
        if (url && text && !this.isDuplicate(url)) {
          const parent = $link.parent();
          const description = parent.text().trim() || text;
          
          this.tools.push({
            name: text,
            url: url,
            description: description.substring(0, 500),
            source: 'React Newsletter',
            date: issue.date
          });
        }
      });
    } catch (error) {
      console.error(`Error scraping React Newsletter issue ${issue.url}:`, error);
    }
  }

  private looksLikeTool(text: string, url: string): boolean {
    // Filter out common non-tool links
    const excludePatterns = [
      /^read more$/i,
      /^learn more$/i,
      /^click here$/i,
      /^sponsored$/i,
      /^article$/i,
      /minute read$/i,
    ];
    
    for (const pattern of excludePatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }
    
    // Include if it looks like a tool name or GitHub repo
    return (
      url.includes('github.com') ||
      url.includes('npmjs.com') ||
      text.length > 3 && text.length < 100
    );
  }

  private isDuplicate(url: string): boolean {
    return this.tools.some(tool => tool.url === url);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveResults(outputPath: string): Promise<void> {
    // Remove duplicates and sort
    const uniqueTools = Array.from(
      new Map(this.tools.map(tool => [tool.url, tool])).values()
    );
    
    const sortedTools = uniqueTools.sort((a, b) => {
      if (a.date && b.date) {
        return b.date.localeCompare(a.date);
      }
      return a.source.localeCompare(b.source);
    });
    
    // Save as JSON
    const jsonPath = outputPath.replace(/\.\w+$/, '.json');
    await fs.writeFile(jsonPath, JSON.stringify(sortedTools, null, 2));
    console.log(`\nSaved ${sortedTools.length} tools to ${jsonPath}`);
    
    // Save as Markdown for easy reading
    const mdPath = outputPath.replace(/\.\w+$/, '.md');
    const markdown = this.generateMarkdown(sortedTools);
    await fs.writeFile(mdPath, markdown);
    console.log(`Saved readable version to ${mdPath}`);
    
    // Print summary
    console.log('\n=== Summary ===');
    console.log(`Total tools found: ${sortedTools.length}`);
    console.log(`TLDR tools: ${sortedTools.filter(t => t.source === 'TLDR').length}`);
    console.log(`React Newsletter tools: ${sortedTools.filter(t => t.source === 'React Newsletter').length}`);
  }

  private generateMarkdown(tools: Tool[]): string {
    let md = '# Newsletter Tools Collection\n\n';
    md += `Total tools: ${tools.length}\n\n`;
    
    // Group by source
    const bySource = tools.reduce((acc, tool) => {
      if (!acc[tool.source]) {
        acc[tool.source] = [];
      }
      acc[tool.source].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
    
    for (const [source, sourceTools] of Object.entries(bySource)) {
      md += `## ${source} (${sourceTools.length} tools)\n\n`;
      
      for (const tool of sourceTools) {
        md += `### ${tool.name}\n`;
        md += `- **URL**: ${tool.url}\n`;
        if (tool.date) {
          md += `- **Date**: ${tool.date}\n`;
        }
        md += `- **Description**: ${tool.description}\n\n`;
      }
    }
    
    return md;
  }

  getTools(): Tool[] {
    return this.tools;
  }
}

// Main execution
async function main() {
  const scraper = new NewsletterScraper();
  
  console.log('Starting newsletter scraping...\n');
  
  // Scrape both newsletters
  await scraper.scrapeTLDRArchive(30); // Last 30 issues
  await scraper.scrapeReactNewsletter(30); // Last 30 issues
  
  // Save results
  const outputPath = path.join(process.cwd(), 'newsletter-tools.json');
  await scraper.saveResults(outputPath);
  
  console.log('\nScraping complete!');
}

main().catch(console.error);
