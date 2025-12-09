import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scanId = searchParams.get('scanId');

  if (!scanId) {
    return NextResponse.json({ message: 'scanId is required' }, { status: 400 });
  }

  const letter = await prisma.claimLetter.findUnique({
    where: { scanId }
  });

  if (!letter) {
    return NextResponse.json({ message: 'Letter not found' }, { status: 404 });
  }

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk as Buffer));

  const completed = new Promise<void>((resolve, reject) => {
    doc.on('end', () => resolve());
    doc.on('error', (err) => reject(err));
  });

  doc.fontSize(18).text('Compensation Claim – AI Refund Generator', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(letter.content, { align: 'left' });

  doc.end();
  await completed;
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="ai-refund-claim.pdf"'
    }
  });
}
