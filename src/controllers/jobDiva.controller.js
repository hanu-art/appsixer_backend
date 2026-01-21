import { XMLParser } from 'fast-xml-parser';
import { successResponse, errorResponse } from '../utils/response.util.js';

/* ================= CACHE CONFIG ================= */
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

let jobCache = {
  allJobs: null,      // formatted jobs array
  rawJobs: null,      // raw XML jobs
  lastFetch: 0,
};

/* ================= XML CONFIG ================= */
const JOB_DIVA_XML_URL =
  'https://www2.jobdiva.com/employers/connect/listofportaljobs.jsp?a=nojdnwqfm92yb6tqpj7w2z2oljbwm70b97mhxwp693m08ft0e6v4o9v0113cjvr6';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseAttributeValue: true,
  trimValues: true,
  allowBooleanAttributes: true,
  parseTagValue: false,
});

/* ================= HELPERS ================= */
const formatJobFromXML = (job, index) => ({
  id: `jobdiva-${job.jobdivaid || Date.now()}-${index}`,
  title: job.title || 'Position Available',
  company: job.company || 'AppSixer LLC',
  location:
    job.city && job.state_abbr
      ? `${job.city}, ${job.state_abbr}`
      : 'Remote',
  description:
    (job.jobdescription_400char || 'Job opportunity available')
      .replace(/&middot;|&amp;|&lt;|&gt;|&quot;|&#39;/g, ' ')
      .substring(0, 150) + '...',
  postedDate: job.issuedate || new Date().toISOString(),
  applyLink: job.portal_url || '#',
  salary: 'Negotiable',
  type: job.positiontype || 'Contract',
  source: 'JobDiva XML Feed',
  rawId: job.jobdivaid,
  jobNumber: job.jobdiva_no,
});

/* ================= CORE FETCH (CACHED) ================= */
const fetchAndCacheJobs = async () => {
  const now = Date.now();

  // ✅ CACHE HIT
  if (jobCache.allJobs && now - jobCache.lastFetch < CACHE_TTL) {
    console.log('⚡ JobDiva served from cache');
    return jobCache;
  }

  console.log('🐢 Fetching JobDiva XML fresh');

  const response = await fetch(JOB_DIVA_XML_URL);
  if (!response.ok) {
    throw new Error(`JobDiva HTTP error: ${response.status}`);
  }

  const xmlText = await response.text();
  const parsedData = xmlParser.parse(xmlText);

  let jobsArray = [];

  if (parsedData?.outertag?.jobs?.job) {
    const jobsData = parsedData.outertag.jobs.job;
    jobsArray = Array.isArray(jobsData) ? jobsData : [jobsData];
  }

  if (!jobsArray.length) {
    throw new Error('No jobs found in XML');
  }

  const formattedJobs = jobsArray.map(formatJobFromXML);

  // ✅ UPDATE CACHE
  jobCache = {
    rawJobs: jobsArray,
    allJobs: formattedJobs,
    lastFetch: now,
  };

  return jobCache;
};

/* ================= GET JOBS ================= */
export const getJobs = async (req, res) => {
  try {
    const { allJobs } = await fetchAndCacheJobs();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;

    const start = (page - 1) * limit;
    const end = start + limit;

    return successResponse(res, {
      message: 'Jobs fetched successfully',
      data: {
        jobs: allJobs.slice(start, end),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(allJobs.length / limit),
          totalJobs: allJobs.length,
          jobsPerPage: limit,
          hasNextPage: end < allJobs.length,
          hasPrevPage: start > 0,
        },
      },
    });
  } catch (error) {
    console.error('getJobs error:', error.message);
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to fetch jobs',
      errors: [error.message],
    });
  }
};

/* ================= GET JOB BY ID ================= */
export const getJobById = async (req, res) => {
  try {
    const { rawJobs } = await fetchAndCacheJobs();
    const requestedId = req.params.id;

    const match = requestedId.match(/jobdiva-(\d+)-(\d+)/);
    if (!match) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid job ID format',
      });
    }

    const index = Number(match[2]);
    const job = rawJobs[index];

    if (!job) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Job not found',
      });
    }

    return successResponse(res, {
      message: 'Job fetched successfully',
      data: {
        job: formatJobFromXML(job, index),
      },
    });
  } catch (error) {
    console.error('getJobById error:', error.message);
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to fetch job details',
    });
  }
};

/* ================= GET JOBS COUNT ================= */
export const getJobsCount = async (req, res) => {
  try {
    const { allJobs, lastFetch } = await fetchAndCacheJobs();

    return successResponse(res, {
      message: 'Jobs count fetched',
      data: {
        totalJobs: allJobs.length,
        lastUpdated: new Date(lastFetch).toISOString(),
        source: 'cache',
      },
    });
  } catch (error) {
    console.error('getJobsCount error:', error.message);
    return errorResponse(res, {
      statusCode: 500,
      message: 'Failed to get jobs count',
    });
  }
};
