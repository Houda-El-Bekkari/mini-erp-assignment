import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    // Formater les données
    const formattedUsers = allUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role as 'admin' | 'operator' | 'client',
      createdAt: user.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      isActive: true,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, password } = body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const newUser = await db.insert(users).values({
      id: `user_${Date.now()}`,
      email,
      name,
      role: role || 'client',
      passwordHash: hashedPassword,
    }).returning();

    return NextResponse.json({
      id: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
      role: newUser[0].role,
      createdAt: newUser[0].createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur. Détails: ' + (error as Error).message },
      { status: 500 }
    );
  }
}