import { connectToDB } from '../../../../utils/database.js';
import GameSession from '../../../../models/gameSession.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return Response.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await connectToDB();
    
    
    const results = await GameSession.find({ userId: userId })
      .sort({ year: 1 }) 
      .lean(); 


    if (!results || results.length === 0) {
      return Response.json({ 
        message: "No results found for this user",
        results: []
      }, { status: 200 }); 
    }

    return Response.json({
      message: "Results fetched successfully",
      results: results
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching results:', error);
    return Response.json({ 
      error: 'Failed to fetch results',
      details: error.message 
    }, { status: 500 });
  }
}