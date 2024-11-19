import CoreValuesPoll from './components/CoreValuesPoll'

function App() {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Core Values Explorer</h1>
        <CoreValuesPoll />
      </div>
    </div>
  )
}

export default App