import asyncpraw
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

async def scrape_movie_news():
    try:
        reddit = asyncpraw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent="CineFiles/1.0"
        )
        
        news_items = []
        subreddit = await reddit.subreddit('movies')
        
        async for submission in subreddit.search('flair:"Article"', sort='hot', limit=6):
            if submission.is_self or not submission.url:
                continue
            
            news_items.append({
                'title': submission.title,
                'url': submission.url,
                'source': f'r/movies • {submission.score:,} points',
                'image': submission.thumbnail if submission.thumbnail.startswith('http') else None,
                'description': submission.selftext[:200] if submission.selftext else ''
            })
            
        logger.info(f"Successfully fetched {len(news_items)} news items")
        await reddit.close()
        return news_items
        
    except Exception as e:
        logger.error(f"Error in scrape_movie_news: {str(e)}", exc_info=True)
        return []