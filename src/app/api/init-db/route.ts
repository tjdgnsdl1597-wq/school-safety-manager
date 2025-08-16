import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('Starting database initialization...');
    
    // First, try to connect to the database
    await prisma.$connect();
    console.log('Database connection successful');

    // Try to create tables using db push
    console.log('Attempting to sync database schema...');
    
    // Test if tables exist by querying them
    try {
      await prisma.school.findFirst();
      await prisma.schedule.findFirst();
      await prisma.material.findFirst();
      console.log('All tables exist and are accessible');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database is already initialized and working properly',
        timestamp: new Date().toISOString()
      });
      
    } catch (tableError) {
      console.log('Tables may not exist, checking specific error:', tableError);
      
      return NextResponse.json({ 
        success: false,
        error: 'Tables do not exist or are not accessible',
        details: tableError instanceof Error ? tableError.message : 'Unknown error',
        suggestion: 'Run prisma db push manually or check DATABASE_URL',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database initialization endpoint. Use POST to test/initialize database.',
    usage: 'POST /api/init-db to check database status'
  });
}