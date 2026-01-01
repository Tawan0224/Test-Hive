import Navbar from '../components/layout/Navbar'

const ProfilePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-8">
            Profile
          </h1>
          <p className="text-white/70 text-lg">
            Profile page coming soon...
          </p>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage