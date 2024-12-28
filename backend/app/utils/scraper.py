"""
Movie News Scraper Utility

This module handles the scraping of movie news from Reddit's r/movies subreddit.
It uses the Reddit API through PRAW to fetch recent, high-quality movie news articles.

Features:
- Asynchronous Reddit API integration
- Filtered news article retrieval
- Error handling and logging
- Image thumbnail extraction
- Source attribution and scoring

The module uses environment-based configuration for Reddit API credentials
and implements rate limiting and proper API etiquette.
"""

import asyncpraw
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

async def scrape_movie_news():
    """
    Fetch recent movie news articles from Reddit's r/movies subreddit.
    
    Returns:
        list: Collection of news articles, each containing:
            - title: Article headline
            - url: Link to full article
            - source: Attribution with Reddit score
            - image: Thumbnail URL (if available)
            - description: Brief excerpt of content
    
    Notes:
        - Only fetches articles with the "Article" flair
        - Filters out self-posts and invalid URLs
        - Limited to 6 hot articles per request
        - Includes Reddit score in source attribution
        - Handles API errors gracefully
        - Properly closes Reddit client connection
    
    Example article format:
        {
            'title': 'New Marvel Movie Announced',
            'url': 'https://example.com/article',
            'source': 'r/movies • 1,234 points',
            'image': 'https://example.com/thumbnail.jpg',
            'description': 'Brief excerpt of the article...'
        }
    """
    try:
        reddit = asyncpraw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
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