import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(dataDir, 'interacoes.json');

    if (fs.existsSync(filePath)) {
      const fileBuffer = await fs.promises.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileBuffer);
      return NextResponse.json(data);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Erro ao ler interacoes.json:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
