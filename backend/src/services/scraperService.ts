import { chromium, Browser, Page } from 'playwright';
import { Profile } from '../models/Profile';

interface LinkedInProfile {
  fullName: string;
  headline: string;
  currentJobTitle: string;
  companyName: string;
  location: string;
  profileUrl: string;
  about: string;
  profilePhoto: string;
}

export class LinkedInScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    console.log('🚀 Initializing LinkedIn scraper...');
    
    this.browser = await chromium.launch({
      headless: false, // Set to true for production, false for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--start-maximized',
        '--disable-blink-features=AutomationControlled'
      ],
      timeout: 60000, // 60 seconds browser launch timeout
    });

    // Add error handling for browser events
    this.browser.on('disconnected', () => {
      console.log('⚠️  Browser disconnected');
    });

    this.page = await this.browser.newPage();
    
    // Set realistic user agent and viewport - using correct Playwright API
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    await this.page.setViewportSize({ width: 1366, height: 768 });
    
    // Add page error handlers
    this.page.on('crash', () => {
      console.log('❌ Page crashed');
    });
    
    this.page.on('close', () => {
      console.log('⚠️  Page closed');
    });
    
    console.log('✅ Browser initialized successfully');
  }

  async scrapeProfiles(searchUrl: string): Promise<LinkedInProfile[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call initialize() first.');
    }

    console.log('🔍 Starting LinkedIn profile scraping...');
    console.log('🔗 URL:', searchUrl);

    const profiles: LinkedInProfile[] = [];

    try {
      // Navigate to LinkedIn search results
      console.log('📡 Navigating to LinkedIn...');
      await this.page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      // Check current URL and handle login/redirects
      const currentUrl = this.page.url();
      console.log('📍 Current URL:', currentUrl);
      
      // Handle LinkedIn login if redirected
      if (currentUrl.includes('login') || currentUrl.includes('challenge') || currentUrl.includes('authwall')) {
        console.log('🔐 LinkedIn login required. Please log in manually...');
        console.log('⏰ You have 90 seconds to complete login...');
        console.log('📋 Steps:');
        console.log('   1. The browser window should be open');
        console.log('   2. Enter your LinkedIn email and password');
        console.log('   3. Complete any 2FA if prompted');
        console.log('   4. Wait for the search results to load');
        
        // Wait for user to manually log in (increased timeout)
        let loginAttempts = 0;
        const maxAttempts = 18; // 180 seconds total (18 * 10 seconds)
        
        while (loginAttempts < maxAttempts) {
          try {
            // Check if browser/page is still available
            if (!this.browser || !this.page) {
              throw new Error('Browser or page was closed during login wait');
            }
            
            // Use a more robust wait approach
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            loginAttempts++;
            
            const newUrl = this.page.url();
            console.log(`⏳ Login check ${loginAttempts}/${maxAttempts} - Current URL: ${newUrl.substring(0, 60)}...`);
            
            // Check if we're no longer on login page
            if (!newUrl.includes('login') && !newUrl.includes('challenge') && !newUrl.includes('authwall')) {
              console.log('✅ Login successful! Proceeding with scraping...');
              break;
            }
            
            if (loginAttempts === maxAttempts) {
              throw new Error('Login timeout - please try again and complete login faster');
            }
          } catch (error) {
            console.error('❌ Error during login wait:', error);
            throw error;
          }
        }
        
        // Try to navigate back to search results after login
        if (!this.page.url().includes('search/results/people')) {
          console.log('🔄 Navigating back to search results...');
          await this.page.goto(searchUrl, { waitUntil: 'networkidle' });
        }
      }

      // Wait for search results with multiple possible selectors
      console.log('🔍 Waiting for search results to load...');
      
      try {
        // Try multiple selectors that LinkedIn might use
        await Promise.race([
          this.page.waitForSelector('.search-results-container', { timeout: 15000 }),
          this.page.waitForSelector('.search-results__list', { timeout: 15000 }),
          this.page.waitForSelector('[data-chameleon-result-urn]', { timeout: 15000 }),
          this.page.waitForSelector('.reusable-search__result-container', { timeout: 15000 })
        ]);
        console.log('✅ Search results loaded successfully');
      } catch (selectorError) {
        // If selectors fail, take a screenshot for debugging
        console.log('📷 Taking screenshot for debugging...');
        await this.page.screenshot({ path: 'linkedin-debug.png', fullPage: true });
        
        // Check what's actually on the page
        const pageTitle = await this.page.title();
        const pageUrl = this.page.url();
        console.log('🔍 Page title:', pageTitle);
        console.log('🔍 Current URL:', pageUrl);
        
        throw new Error(`Could not find search results. Page title: "${pageTitle}". Check linkedin-debug.png for page content.`);
      }

      // Scroll to load more results
      await this.autoScroll();

      // Extract profile data from search results - try multiple selectors
      let profileElements: any[] = [];
      try {
        profileElements = await this.page.$$('.reusable-search__result-container');
        if (profileElements.length === 0) {
          profileElements = await this.page.$$('[data-chameleon-result-urn]');
        }
        if (profileElements.length === 0) {
          profileElements = await this.page.$$('.search-result__wrapper');
        }
      } catch (error) {
        console.log('⚠️  Error finding profile elements:', error);
        profileElements = [];
      }
      
      console.log(`📊 Found ${profileElements.length} profile elements`);

      if (profileElements.length === 0) {
        console.log('📷 No profiles found - taking debug screenshot...');
        await this.page.screenshot({ path: 'linkedin-no-profiles.png', fullPage: true });
        throw new Error('No profile elements found on the page. Check linkedin-no-profiles.png');
      }

      for (let i = 0; i < Math.min(profileElements.length, 25); i++) {
        try {
          const element = profileElements[i];
          
          // Debug: Get the HTML content of this element for inspection
          const elementHTML = await element.innerHTML();
          console.log(`🔍 Profile ${i + 1} HTML snippet:`, elementHTML.substring(0, 200) + '...');
          
          // Extract profile data with comprehensive selectors
          const profileData = await element.evaluate((el: any) => {
            console.log('🔍 Element classes:', el.className);
            
            let fullName = '';
            let headline = '';
            let location = '';
            let profileUrl = '';
            let profilePhoto = '';
            
            // 1. Extract Profile URL - Look for main profile links
            const profileLinks = el.querySelectorAll('a[href*="/in/"]');
            for (let link of profileLinks) {
              if (link.href && link.href.includes('/in/') && 
                  !link.href.includes('miniProfileUrn') && 
                  link.href.includes('linkedin.com')) {
                profileUrl = link.href.split('?')[0]; // Clean URL
                console.log('✅ Found profile URL:', profileUrl);
                break;
              }
            }
            
            // 2. Extract Full Name - Look for specific patterns
            // Pattern 1: <span aria-hidden="true"><!---->Name<!----></span>
            const nameSpans = el.querySelectorAll('span[aria-hidden="true"]');
            for (let span of nameSpans) {
              const text = span.textContent?.trim();
              if (text && 
                  text.length > 2 && 
                  text.length < 60 && 
                  !text.includes('•') && 
                  !text.includes('Status') && 
                  !text.includes('connection') && 
                  !text.includes('View') && 
                  !text.includes('degree') &&
                  /^[A-Za-z\s]+$/.test(text) && // Only letters and spaces
                  text.split(' ').length >= 2) { // At least first and last name
                
                fullName = text;
                console.log('✅ Found name from span:', fullName);
                break;
              }
            }
            
            // Fallback: Extract name from profile URL if not found
            if (!fullName && profileUrl) {
              const urlMatch = profileUrl.match(/\/in\/([^?]+)/);
              if (urlMatch) {
                const urlSlug = urlMatch[1];
                fullName = urlSlug.replace(/-/g, ' ')
                                 .replace(/\b\w/g, l => l.toUpperCase())
                                 .replace(/\d+/g, ''); // Remove numbers
                console.log('🎯 Name from URL fallback:', fullName);
              }
            }
            
            // 3. Extract Job Title/Headline - Look for specific CSS classes
            // Pattern: <div class="TAYewapuqMgOfnEuxivFUjMXDEiimxOfaZyY t-14 t-black t-normal"><!---->Job Title<!----></div>
            const headlineSelectors = [
              '.TAYewapuqMgOfnEuxivFUjMXDEiimxOfaZyY',
              '[class*="t-14 t-black t-normal"]',
              '.entity-result__primary-subtitle'
            ];
            
            for (let selector of headlineSelectors) {
              const headlineEl = el.querySelector(selector);
              if (headlineEl) {
                const text = headlineEl.textContent?.trim();
                if (text && 
                    text.length > 3 && 
                    text.length < 200 && 
                    !text.includes('•') && 
                    !text.includes('connection') &&
                    !text.includes('Status')) {
                  headline = text;
                  console.log('✅ Found headline:', headline);
                  break;
                }
              }
            }
            
            // 4. Extract Location - Look for location-specific patterns
            // Pattern: <div class="eQffXYRHIZcCSOyKEFlUnrgTCIPHCHkkToUw t-14 t-normal"><!---->Location<!----></div>
            const locationSelectors = [
              '.eQffXYRHIZcCSOyKEFlUnrgTCIPHCHkkToUw',
              '[class*="t-14 t-normal"]:not([class*="t-black"])'
            ];
            
            for (let selector of locationSelectors) {
              const locationEl = el.querySelector(selector);
              if (locationEl) {
                const text = locationEl.textContent?.trim();
                if (text && 
                    text.length > 2 && 
                    text.length < 100 && 
                    !text.includes('•') && 
                    !text.includes('connection') &&
                    text !== fullName && 
                    text !== headline) {
                  location = text;
                  console.log('✅ Found location:', location);
                  break;
                }
              }
            }
            
            // 5. Extract Profile Photo
            const images = el.querySelectorAll('img');
            for (let img of images) {
              if (img.src && 
                  (img.src.includes('profile-displayphoto') || 
                   img.src.includes('media.licdn.com')) &&
                  img.alt && 
                  img.alt !== 'LinkedIn' &&
                  !img.src.includes('icon')) {
                profilePhoto = img.src;
                console.log('✅ Found photo:', profilePhoto.substring(0, 50) + '...');
                break;
              }
            }
            
            // Clean up and validate data
            fullName = fullName || 'LinkedIn User';
            headline = headline || 'Professional';
            location = location || 'Not specified';
            
            // Extract company and job title from headline
            let currentJobTitle = headline;
            let companyName = 'Not specified';
            
            if (headline.includes(' at ')) {
              const parts = headline.split(' at ');
              currentJobTitle = parts[0]?.trim() || headline;
              companyName = parts[1]?.trim() || 'Not specified';
            }
            
            console.log('📋 Final extracted data:', { 
              fullName, 
              headline, 
              currentJobTitle, 
              companyName, 
              location, 
              hasUrl: !!profileUrl,
              hasPhoto: !!profilePhoto 
            });

            return {
              fullName,
              headline,
              currentJobTitle,
              companyName,
              location,
              profileUrl: profileUrl || '',
              about: '',
              profilePhoto: profilePhoto || ''
            };
          });

          console.log(`🔍 Profile ${i + 1} raw data:`, profileData);

          // Clean up profile URL
          if (profileData.profileUrl) {
            profileData.profileUrl = profileData.profileUrl.split('?')[0]; // Remove query parameters
            if (!profileData.profileUrl.startsWith('http')) {
              profileData.profileUrl = 'https://www.linkedin.com' + profileData.profileUrl;
            }
          }

          // More lenient validation - prioritize valid profiles
          const hasValidName = profileData.fullName && 
                              profileData.fullName !== 'Unknown' && 
                              profileData.fullName !== 'LinkedIn User' &&
                              profileData.fullName.length > 3 &&
                              /^[A-Za-z\s]+$/.test(profileData.fullName);
          const hasValidUrl = profileData.profileUrl && 
                             profileData.profileUrl.includes('linkedin.com') &&
                             profileData.profileUrl.includes('/in/') &&
                             profileData.profileUrl.length > 30;
          const hasValidHeadline = profileData.headline && 
                                  profileData.headline !== 'Professional' &&
                                  profileData.headline.length > 5;

          if (hasValidName && (hasValidUrl || hasValidHeadline)) {
            // Generate a fallback URL if missing but we have a name
            if (!profileData.profileUrl && hasValidName) {
              const urlSlug = profileData.fullName.toLowerCase()
                                                  .replace(/\s+/g, '-')
                                                  .replace(/[^a-z-]/g, '');
              profileData.profileUrl = `https://www.linkedin.com/in/${urlSlug}`;
              console.log(`🔄 Generated fallback URL: ${profileData.profileUrl}`);
            }
            
            profiles.push(profileData as LinkedInProfile);
            console.log(`✅ Successfully scraped profile ${i + 1}: ${profileData.fullName} - ${profileData.currentJobTitle}`);
          } else {
            console.log(`⚠️  Skipping profile ${i + 1} - insufficient quality data:`, {
              hasValidName,
              hasValidUrl,
              hasValidHeadline,
              nameLength: profileData.fullName?.length,
              name: profileData.fullName,
              url: profileData.profileUrl?.substring(0, 50)
            });
          }

          // Human-like delay between extractions
          await this.randomDelay(500, 1500);

        } catch (error) {
          console.log(`❌ Error extracting profile ${i + 1}:`, error);
          continue;
        }
      }

      console.log(`🎉 Successfully scraped ${profiles.length} profiles`);
      return profiles;

    } catch (error) {
      console.error('❌ Scraping error:', error);
      throw new Error(`Failed to scrape LinkedIn profiles: ${error}`);
    }
  }

  private async autoScroll() {
    if (!this.page) return;

    console.log('📜 Auto-scrolling to load more results...');
    
    for (let i = 0; i < 3; i++) {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await this.randomDelay(2000, 4000);
      
      // Check if "Show more results" button exists and click it
      try {
        const showMoreButton = await this.page.$('.artdeco-pagination__button--next');
        if (showMoreButton) {
          await showMoreButton.click();
          await this.randomDelay(3000, 5000);
        }
      } catch (error) {
        // Button might not exist, continue
      }
    }
  }

  private async randomDelay(min: number, max: number) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async saveProfilesToDatabase(profiles: LinkedInProfile[]): Promise<void> {
    console.log('💾 Saving profiles to database...');
    
    const savedProfiles = [];
    
    for (const profileData of profiles) {
      try {
        // Check if profile already exists
        const existingProfile = await Profile.findOne({ 
          profileUrl: profileData.profileUrl 
        });

        if (!existingProfile) {
          const profile = new Profile({
            ...profileData,
            scrapedAt: new Date()
          });
          
          await profile.save();
          savedProfiles.push(profile);
          console.log(`✅ Saved: ${profileData.fullName}`);
        } else {
          console.log(`⚠️  Profile already exists: ${profileData.fullName}`);
        }
      } catch (error) {
        console.error(`❌ Error saving profile ${profileData.fullName}:`, error);
      }
    }

    console.log(`🎉 Saved ${savedProfiles.length} new profiles to database`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser cleanup completed');
    }
  }
}

// Main scraping function
export const scrapeLinkedInProfiles = async (searchUrl: string): Promise<{
  success: boolean;
  count: number;
  profiles?: LinkedInProfile[];
  message?: string;
}> => {
  const scraper = new LinkedInScraper();
  
  try {
    await scraper.initialize();
    const profiles = await scraper.scrapeProfiles(searchUrl);
    await scraper.saveProfilesToDatabase(profiles);
    
    console.log('🎉 Scraping completed successfully, preparing response...');
    
    const result = {
      success: true,
      count: profiles.length,
      profiles: profiles,
      message: `Successfully scraped and saved ${profiles.length} profiles`
    };
    
    // Cleanup after a delay to allow response to be sent
    process.nextTick(() => {
      setTimeout(async () => {
        console.log('🧹 Starting cleanup process...');
        await scraper.cleanup();
      }, 5000);
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    
    // Check if error is related to login or browser issues
    const errorMessage = String(error);
    if (errorMessage.includes('Login timeout') || 
        errorMessage.includes('login') || 
        errorMessage.includes('authwall') ||
        errorMessage.includes('Target page, context or browser has been closed')) {
      console.log('🔄 Login or browser error detected. Keeping browser open for manual intervention...');
      
      // Auto-cleanup after 15 minutes to prevent memory leaks
      setTimeout(async () => {
        console.log('🧹 Auto-cleanup after 15 minutes...');
        await scraper.cleanup();
      }, 900000); // 15 minutes
    } else {
      // For other errors, cleanup after a short delay
      setTimeout(async () => {
        await scraper.cleanup();
      }, 5000);
    }
    
    return {
      success: false,
      count: 0,
      message: `Scraping failed: ${error}`
    };
  }
  // Removed finally block completely to prevent premature cleanup
}; 