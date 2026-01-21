import Parser from 'rss-parser';

const parser = new Parser();
const JOB_DIVA_RSS_URL = 'https://www2.jobdiva.com/portal/?a=nojdnwqfm92yb6tqpj7w2z2oljbwm70b97mhxwp693m08ft0e6v4o9v0113cjvr6#/jobrss';

const extractLocation = (item) => {
  const text = `${item.title} ${item.content || ''}`.toLowerCase();
  if (text.includes('new york') || text.includes('nyc')) return 'New York';
  if (text.includes('remote')) return 'Remote';
  return 'Multiple Locations';
};

const cleanText = (text) => {
  return text?.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' || 'No description available';
};

export const fetchJobDivaJobs = async () => {
  try {
    const feed = await parser.parseURL(JOB_DIVA_RSS_URL);
    
    const jobs = feed.items.map((item, index) => ({
      id: `jobdiva-${index}`,
      title: item.title || 'Job Title',
      company: item.creator || 'JobDiva Company',
      location: extractLocation(item),
      description: cleanText(item.contentSnippet),
      date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : new Date().toLocaleDateString(),
      salary: 'Negotiable',
      type: 'Full-time',
      link: item.link || '#',
      source: 'JobDiva'
    }));
    
    return jobs;
  } catch (error) {
    console.error('JobDiva RSS Error:', error);
    return [];
  }
};