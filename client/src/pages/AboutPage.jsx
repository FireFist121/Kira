import About from '../components/About';

export default function AboutPage({ data }) {
  return (
    <div className="page-container" style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <About profile={data?.profile} />
    </div>
  );
}
