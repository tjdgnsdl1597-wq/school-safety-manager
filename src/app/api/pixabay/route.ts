import { NextRequest, NextResponse } from 'next/server';

interface PixabayImage {
  id: number;
  pageURL: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'school safety';
    const perPage = parseInt(searchParams.get('per_page') || '12');
    const page = parseInt(searchParams.get('page') || '1');

    const PIXABAY_KEY = process.env.PIXABAY_KEY;

    if (!PIXABAY_KEY) {
      console.warn('PIXABAY_KEY not found, returning placeholder images');
      
      // Fallback placeholder data
      const placeholderImages: PixabayImage[] = Array.from({ length: perPage }, (_, index) => ({
        id: index + 1,
        pageURL: '#',
        previewURL: `/api/placeholder/150/150?text=Image${index + 1}`,
        webformatURL: `/api/placeholder/640/426?text=SchoolSafety${index + 1}`,
        largeImageURL: `/api/placeholder/1920/1280?text=SchoolSafety${index + 1}`,
        tags: `학교 안전, 교육, 안전관리, safety, school, education`
      }));

      return NextResponse.json({
        total: 100,
        totalHits: perPage,
        hits: placeholderImages
      });
    }

    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=all&category=people,buildings,places&min_width=640&min_height=426&per_page=${perPage}&page=${page}&safesearch=true`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'School-Safety-Manager/1.0'
      },
      next: { revalidate: 86400 } // 24 hours cache
    });

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data: PixabayResponse = await response.json();

    // Filter and enhance images with safety-related context
    const enhancedImages = data.hits.map(image => ({
      ...image,
      tags: image.tags.includes('safety') || image.tags.includes('school') 
        ? image.tags 
        : `${image.tags}, 학교 안전, 교육 안전`
    }));

    return NextResponse.json({
      total: data.total,
      totalHits: data.totalHits,
      hits: enhancedImages
    });

  } catch (error) {
    console.error('Pixabay API error:', error);
    
    // Return fallback placeholder images on error
    const fallbackImages: PixabayImage[] = [
      {
        id: 1,
        pageURL: '#',
        previewURL: '/api/placeholder/150/150?text=Safety1',
        webformatURL: '/api/placeholder/640/426?text=학교안전교육',
        largeImageURL: '/api/placeholder/1920/1280?text=학교안전교육',
        tags: '학교 안전, 안전교육, 교육, safety education'
      },
      {
        id: 2,
        pageURL: '#',
        previewURL: '/api/placeholder/150/150?text=Safety2',
        webformatURL: '/api/placeholder/640/426?text=실험실안전',
        largeImageURL: '/api/placeholder/1920/1280?text=실험실안전',
        tags: '실험실 안전, 화학물질, 과학실, laboratory safety'
      },
      {
        id: 3,
        pageURL: '#',
        previewURL: '/api/placeholder/150/150?text=Safety3',
        webformatURL: '/api/placeholder/640/426?text=급식실안전',
        largeImageURL: '/api/placeholder/1920/1280?text=급식실안전',
        tags: '급식실 안전, 위생관리, 식품안전, cafeteria safety'
      },
      {
        id: 4,
        pageURL: '#',
        previewURL: '/api/placeholder/150/150?text=Safety4',
        webformatURL: '/api/placeholder/640/426?text=소방안전',
        largeImageURL: '/api/placeholder/1920/1280?text=소방안전',
        tags: '소방 안전, 화재예방, 대피훈련, fire safety'
      },
      {
        id: 5,
        pageURL: '#',
        previewURL: '/api/placeholder/150/150?text=Safety5',
        webformatURL: '/api/placeholder/640/426?text=개인보호구',
        largeImageURL: '/api/placeholder/1920/1280?text=개인보호구',
        tags: '개인보호구, PPE, 안전장비, protective equipment'
      },
      {
        id: 6,
        pageURL: '#',
        previewURL: '/api/placeholder/150/150?text=Safety6',
        webformatURL: '/api/placeholder/640/426?text=위험성평가',
        largeImageURL: '/api/placeholder/1920/1280?text=위험성평가',
        tags: '위험성평가, 안전점검, 예방관리, risk assessment'
      }
    ];

    return NextResponse.json({
      total: 6,
      totalHits: 6,
      hits: fallbackImages
    });
  }
}