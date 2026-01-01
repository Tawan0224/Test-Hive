import Navbar from '../components/layout/Navbar'

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-8">
            About TestHive
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            TestHive is a gamified learning platform where you can create, take, and share 
            quizzes and flashcards. Our AI-powered system can automatically generate questions 
            from your PDFs, making study material creation faster and more accessible.
          </p>
        </div>
      </main>
    </div>
  )
}

export default AboutPage