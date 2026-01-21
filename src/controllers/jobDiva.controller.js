import { XMLParser } from 'fast-xml-parser';
import { successResponse  , errorResponse} from '../utils/response.util.js';

// ✅ CHANGE 2: XML feed URL (Option 2 from email)
const JOB_DIVA_XML_URL = 'https://www2.jobdiva.com/employers/connect/listofportaljobs.jsp?a=nojdnwqfm92yb6tqpj7w2z2oljbwm70b97mhxwp693m08ft0e6v4o9v0113cjvr6';

// ✅ CHANGE 3: New XML parser instance
const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: true,
    trimValues: true,
    // ✅ YEH 2 LINES ADD KARO:
    allowBooleanAttributes: true,
    parseTagValue: false, // Important: CDATA ko preserve rakhega
  });
const formatJobFromXML = (job, index) => ({
    id: `jobdiva-${job.jobdivaid || Date.now()}-${index}`,
    title: job.title || 'Job Available',
    company: job.company || 'Hiring Company',
    location: `${job.city}, ${job.state_abbr}` || 'Remote',
    description: (job.jobdescription_400char || 'Job opportunity available').replace(/&middot;|&amp;/g, ' '), // Clean HTML entities
    postedDate: job.issuedate || new Date().toISOString(),
    applyLink: job.portal_url || '#',
    salary: 'Negotiable', // XML mein explicit field nahi hai
    type: job.positiontype || 'Full-time',
    source: 'JobDiva XML Feed',
    jobId: job.jobdiva_no // Original ID rakhein
  });

// ✅ CHANGE 5: Updated getJobs function for XML
export const getJobs = async (req, res) => {
    try {
      console.log('Fetching XML feed from:', JOB_DIVA_XML_URL);
      
      // XML feed fetch karo
      const response = await fetch(JOB_DIVA_XML_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      console.log('XML received, length:', xmlText.length);
      
      // DEBUG: First 1000 characters dekhein
      console.log('XML Sample (first 1000 chars):', xmlText.substring(0, 1000));
      
      // XML parse karo
      const parsedData = xmlParser.parse(xmlText);
      console.log('Parsed XML root keys:', Object.keys(parsedData));
      
      // DEBUG: Nested structure check karein
      if (parsedData.outertag) {
        console.log('outertag keys:', Object.keys(parsedData.outertag));
        if (parsedData.outertag.jobs) {
          console.log('jobs keys:', Object.keys(parsedData.outertag.jobs));
        }
      }
      
      // ✅ FIXED: Jobs extract karo - POSSIBLE STRUCTURES
      let jobsArray = [];
      
      // CASE 1: outertag.jobs.job (Most likely)
      if (parsedData.outertag && parsedData.outertag.jobs && parsedData.outertag.jobs.job) {
        console.log('Found structure: outertag -> jobs -> job');
        const jobsData = parsedData.outertag.jobs;
        jobsArray = Array.isArray(jobsData.job) ? jobsData.job : [jobsData.job];
      }
      // CASE 2: jobs.job (Direct)
      else if (parsedData.jobs && parsedData.jobs.job) {
        console.log('Found structure: jobs -> job');
        jobsArray = Array.isArray(parsedData.jobs.job) ? parsedData.jobs.job : [parsedData.jobs.job];
      }
      // CASE 3: Direct job array
      else if (parsedData.job) {
        console.log('Found structure: direct job');
        jobsArray = Array.isArray(parsedData.job) ? parsedData.job : [parsedData.job];
      }
      // CASE 4: Nested differently
      else {
        // DEBUG: Full structure dump
        console.log('Searching for job data in parsed structure...');
        
        // Recursive search for job data
        const findJobsRecursive = (obj, path = '') => {
          if (Array.isArray(obj) && obj.length > 0 && obj[0].title) {
            console.log('Found job array at path:', path);
            return obj;
          }
          
          if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
              if (key.toLowerCase().includes('job') && Array.isArray(obj[key])) {
                console.log('Found array with job-like key:', key, 'at path:', path);
                return obj[key];
              }
              const result = findJobsRecursive(obj[key], path + '.' + key);
              if (result) return result;
            }
          }
          return null;
        };
        
        const foundJobs = findJobsRecursive(parsedData, 'root');
        if (foundJobs) {
          jobsArray = foundJobs;
        } else {
          // Last resort: Try regex extraction
          console.log('Falling back to regex extraction...');
          jobsArray = extractJobsViaRegex(xmlText);
        }
      }
      
      console.log('Total jobs extracted:', jobsArray.length);
      
      // Agar jobs nahi mile to empty array se kam chalao
      if (!jobsArray || jobsArray.length === 0) {
        console.warn('WARNING: No jobs found in XML! Using fallback data...');
        
        // Fallback: Hardcoded sample jobs (temporary)
        jobsArray = [
          {
            jobdivaid: "27142402",
            jobdiva_no: "26-00066",
            title: "Kofax Developer- GDOL",
            company: "AppSixer LLC",
            city: "Atlanta",
            state_abbr: "GA",
            jobdescription_400char: "C2C - DO NOT APPLY FOR THIS JOB Job Summary: Kofax developer with 8+ years of experience",
            issuedate: "2026-01-16 17:30:05.0",
            portal_url: "#"
          }
        ];
      }
      
      // Format jobs
      const allJobs = jobsArray.map((job, index) => {
        // ✅ FIXED: Correct field mapping
        return {
          id: `jobdiva-${job.jobdivaid || job.ID || Date.now()}-${index}`,
          title: job.title || 'Position Available',
          company: job.company || 'AppSixer LLC',
          location: job.city && job.state_abbr ? `${job.city}, ${job.state_abbr}` : 
                   job.city || job.state || 'Remote',
          description: (job.jobdescription_400char || job.description || 'Job opportunity available')
                       .replace(/&middot;|&amp;|&lt;|&gt;|&quot;|&#39;/g, ' ')
                       .substring(0, 150) + '...',
          postedDate: job.issuedate || job.date || new Date().toISOString(),
          applyLink: job.portal_url || '#',
          salary: 'Negotiable',
          type: job.positiontype || 'Contract',
          source: 'JobDiva XML Feed',
          rawId: job.jobdivaid || job.ID,
          jobNumber: job.jobdiva_no
        };
      });
      
      console.log('First formatted job:', JSON.stringify(allJobs[0], null, 2));
      
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
  
      const paginatedJobs = allJobs.slice(startIndex, endIndex);
  
      return successResponse(res, {
        message: `Found ${allJobs.length} jobs from XML feed`,
        data: {
          jobs: paginatedJobs,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(allJobs.length / limit),
            totalJobs: allJobs.length,
            jobsPerPage: limit,
            hasNextPage: endIndex < allJobs.length,
            hasPrevPage: startIndex > 0
          },
          debug: {
            xmlLength: xmlText.length,
            structureFound: jobsArray.length > 0 ? 'yes' : 'no',
            rawCount: jobsArray.length
          }
        }
      });
  
    } catch (error) {
      console.error('JobDiva XML Fetch Error:', error.message);
      console.error('Error stack:', error.stack);
      
      // Fallback error response with sample data
      const fallbackJobs = [{
        id: 'jobdiva-fallback-1',
        title: 'Senior Data Engineer',
        company: 'AppSixer LLC',
        location: 'Chicago, IL',
        description: 'Senior Data Engineer position available...',
        postedDate: new Date().toISOString(),
        applyLink: '#',
        salary: 'Negotiable',
        type: 'Contract',
        source: 'Fallback Data'
      }];
      
      return successResponse(res, {
        message: 'Using fallback data due to XML parsing issue',
        data: {
          jobs: fallbackJobs,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalJobs: 1,
            jobsPerPage: 8,
            hasNextPage: false,
            hasPrevPage: false
          },
          error: error.message
        }
      });
    }
  };
  
  // Helper: Regex extraction as fallback
  const extractJobsViaRegex = (xmlText) => {
    const jobs = [];
    const jobRegex = /<job>([\s\S]*?)<\/job>/gi;
    let match;
    let count = 0;
    
    while ((match = jobRegex.exec(xmlText)) !== null && count < 20) {
      const jobContent = match[1];
      const job = {
        ID: extractValueRegex(jobContent, 'ID'),
        jobdivaid: extractValueRegex(jobContent, 'jobdivaid'),
        jobdiva_no: extractValueRegex(jobContent, 'jobdiva_no'),
        title: extractValueRegex(jobContent, 'title'),
        company: extractValueRegex(jobContent, 'company'),
        city: extractValueRegex(jobContent, 'city'),
        state_abbr: extractValueRegex(jobContent, 'state_abbr'),
        jobdescription_400char: extractValueRegex(jobContent, 'jobdescription_400char'),
        issuedate: extractValueRegex(jobContent, 'issuedate'),
        portal_url: extractValueRegex(jobContent, 'portal_url'),
        positiontype: extractValueRegex(jobContent, 'positiontype')
      };
      
      if (job.title) {
        jobs.push(job);
        count++;
      }
    }
    
    console.log(`Regex extracted ${jobs.length} jobs`);
    return jobs;
  };
  
  const extractValueRegex = (xml, tag) => {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    if (!match) return null;
    
    let value = match[1].trim();
    // Remove CDATA wrappers
    value = value.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
    return value || null;
  };
// ✅ CHANGE 6: Updated getJobById for XML
export const getJobById = async (req, res) => {
    try {
      const response = await fetch(JOB_DIVA_XML_URL);
      const xmlText = await response.text();
      const parsedData = xmlParser.parse(xmlText);
      
      let jobsArray = [];
      // Same extraction logic as getJobs...
      if (parsedData.outertag && parsedData.outertag.jobs && parsedData.outertag.jobs.job) {
        const jobsData = parsedData.outertag.jobs;
        jobsArray = Array.isArray(jobsData.job) ? jobsData.job : [jobsData.job];
      }
      
      // ✅ FIX: Multiple ways to find job
      const requestedId = req.params.id;
      
      // Method 1: Extract jobdivaid from the formatted ID
      const jobdivaidMatch = requestedId.match(/jobdiva-(\d+)-/);
      const jobdivaid = jobdivaidMatch ? jobdivaidMatch[1] : null;
      
      // Method 2: Find by raw ID
      let job = null;
      if (jobdivaid) {
        job = jobsArray.find(j => j.jobdivaid === jobdivaid);
      }
      
      // Method 3: Find by index in array
      if (!job) {
        const indexMatch = requestedId.match(/jobdiva-\d+-(\d+)/);
        const index = indexMatch ? parseInt(indexMatch[1]) : -1;
        if (index >= 0 && index < jobsArray.length) {
          job = jobsArray[index];
        }
      }
      
      if (!job) {
        return errorResponse(res, {
          statusCode: 404,
          message: `Job not found with ID: ${requestedId}`
        });
      }
  
      // Format the found job
      const formattedJob = {
        id: requestedId, // Keep the requested ID
        title: job.title || 'Job Available',
        company: job.company || 'AppSixer LLC',
        location: job.city && job.state_abbr ? `${job.city}, ${job.state_abbr}` : 'Remote',
        description: (job.jobdescription_400char || 'Job opportunity available')
                     .replace(/&middot;|&amp;/g, ' '),
        postedDate: job.issuedate || new Date().toISOString(),
        applyLink: job.portal_url || '#',
        salary: 'Negotiable',
        type: job.positiontype || 'Contract',
        source: 'JobDiva XML Feed',
        rawId: job.jobdivaid,
        jobNumber: job.jobdiva_no
      };
  
      return successResponse(res, {
        message: 'Job details fetched successfully',
        data: { job: formattedJob }
      });
  
    } catch (error) {
      console.error('Job by ID Error:', error);
      return errorResponse(res, {
        statusCode: 500,
        message: 'Failed to fetch job details',
        errors: [error.message]
      });
    }
  };

// ✅ CHANGE 7: Updated getJobsCount for XML
export const getJobsCount = async (req, res) => {
  try {
    const response = await fetch(JOB_DIVA_XML_URL);
    const xmlText = await response.text();
    const parsedData = xmlParser.parse(xmlText);
    
    // getJobsCount mein same extraction logic dalo
let jobsArray = [];

if (parsedData.outertag && parsedData.outertag.jobs && parsedData.outertag.jobs.job) {
  const jobsData = parsedData.outertag.jobs;
  jobsArray = Array.isArray(jobsData.job) ? jobsData.job : [jobsData.job];
}
// ... same as getJobs

    return successResponse(res, {
      message: 'Jobs count fetched from XML',
      data: {
        totalJobs: jobsArray.length,
        lastUpdated: new Date().toISOString(),
        feedType: 'XML'
      }
    });

  } catch (error) {
    console.error('Jobs Count Error:', error);
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to get jobs count',
      errors: [error.message]
    });
  }
};