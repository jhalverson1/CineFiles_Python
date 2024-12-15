import asyncpraw
import os
from dotenv import load_dotenv

load_dotenv()

async def scrape_movie_news():
    try:
        # Initialize Reddit client
        reddit = asyncpraw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent="CineFiles/1.0"
        )
        
        news_items = []
        subreddit = await reddit.subreddit('movies')
        
        # Search specifically for posts with Article flair
        async for submission in subreddit.search('flair:"Article"', sort='hot', limit=6):
            # Skip posts without links or self posts
            if submission.is_self or not submission.url:
                continue
                
            print(f"Found article: {submission.title}")
            
            # Get thumbnail image
            image_url = None
            if hasattr(submission, 'preview'):
                try:
                    image_url = submission.preview['images'][0]['source']['url']
                except:
                    pass
            elif submission.thumbnail and submission.thumbnail.startswith('http'):
                image_url = submission.thumbnail
                
            news_items.append({
                'title': submission.title,
                'url': submission.url,
                'source': f'r/movies • {submission.score:,} points',
                'image': image_url,
                'description': submission.selftext[:200] if submission.selftext else ''
            })
            
        print(f"Found {len(news_items)} articles")
        await reddit.close()
        return news_items
        
    except Exception as e:
        print(f"Error fetching from Reddit: {str(e)}")
        return []