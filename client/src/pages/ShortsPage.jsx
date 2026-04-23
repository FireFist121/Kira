import ContentShowcase from '../components/ContentShowcase';

export default function ShortsPage() {
  // We can pass a prop to ContentShowcase if we want to force the tab to shorts,
  // but for now we render it and the user can select the shorts tab.
  // Ideally, we could modify ContentShowcase to accept an initialTab prop.
  return (
    <div className="page-container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <ContentShowcase id="shorts" title="Shorts & Reels" subtitle="Bite-sized, high-impact content." />
    </div>
  );
}
