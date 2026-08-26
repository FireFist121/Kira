import ContentShowcase from '../components/ContentShowcase';

export default function ProjectsPage({ data }) {
  // Use a slight variation of the ContentShowcase or just render it directly
  return (
    <div className="page-container" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <ContentShowcase id="projects" title="All Projects" subtitle="Explore my portfolio of video editing and thumbnails." />
    </div>
  );
}
