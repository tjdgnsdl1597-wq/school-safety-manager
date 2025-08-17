import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        attachments: {
          orderBy: {
            uploadOrder: 'asc'
          }
        }
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 });
  }
}