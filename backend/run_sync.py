import asyncio
import sys
import os

# Add the backend directory to path so imports work correctly
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.sync import SyncService

async def main():
    print("Initializing MoviePulse Synchronization...")
    try:
        service = SyncService()
        print("Contacting TMDB and starting movie pipeline sync (max_pages=2)...")
        result = await service.sync_pipeline(max_pages=2)
        print("\nSync completed successfully!")
        print("Results:")
        for k, v in result.items():
            print(f"  {k}: {v}")
    except Exception as e:
        print(f"\nSync failed with exception: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
