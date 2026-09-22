import { NextResponse } from 'next/server';

export async function GET() {
  const ploomesApiKey = process.env.PLOOMES_API_KEY;

  if (!ploomesApiKey) {
    return NextResponse.json({ error: 'API key não configurada' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api2.ploomes.com/Users?$top=200&$expand=Teams($expand=Team)', {
      headers: {
        'User-Key': ploomesApiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
      throw new Error(`Erro na API do Ploomes: ${res.status}`);
    }

    const data = await res.json();

    // Filtra para trazer apenas usuários ATIVOS e que NÃO são integrações/robôs
    const usuariosAtivos = data.value.filter((u: any) => u.Suspended === false && u.Integration === false);

    const usuarios = usuariosAtivos.map((user: any) => {
      // Extrai todos os nomes de equipe que o usuário faz parte
      const equipes = user.Teams 
        ? user.Teams.map((t: any) => t.Team ? t.Team.Name : '').filter(Boolean)
        : [];
        
      return {
        id: user.Id,
        nome: user.Name || 'Sem Nome',
        email: user.Email || 'Sem Email',
        equipes: equipes,
      };
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários do Ploomes:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar usuários' }, { status: 500 });
  }
}
