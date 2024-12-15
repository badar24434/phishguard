import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Update path to point to the correct location of tools.json
    const toolsPath = path.join(process.cwd(), 'server', 'tools.json');
    const toolsData = await fs.readFile(toolsPath, 'utf8');
    const tools = JSON.parse(toolsData);
    
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error loading tools:', error);
    return NextResponse.json({ error: 'Failed to load tools data' }, { status: 500 });
  }
}
