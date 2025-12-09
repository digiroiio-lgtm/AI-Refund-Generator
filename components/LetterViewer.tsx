interface LetterViewerProps {
  content: string;
}

export function LetterViewer({ content }: LetterViewerProps) {
  return (
    <article className="whitespace-pre-line rounded-3xl border border-gray-100 bg-white p-6 text-base leading-7 text-gray-800 shadow-sm">
      {content}
    </article>
  );
}
