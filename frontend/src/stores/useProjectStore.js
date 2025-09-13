import { create } from 'zustand';

const useProjectStore = create((set) => ({
  projects: [
    {
      id: 'BC-001',
      title: 'Mangrove Restoration - Sundarbans',
      ngo: 'Green Coast Foundation',
      location: 'West Bengal, India',
      coordinates: { lat: 21.9497, lng: 88.2743 },
      status: 'verified',
      progress: 85,
      carbonCredits: 450,
      targetSpecies: ['Rhizophora mucronata', 'Avicennia marina'],
      area: 125.5,
      startDate: '2024-01-15',
      lastUpdate: '2024-08-20',
      totalFunding: 2500000,
      description: 'Large-scale mangrove restoration project focusing on native species reintroduction and community involvement.',
      iotSensors: 12,
      dataPoints: 8450
    },
    {
      id: 'BC-002',
      title: 'Seagrass Conservation - Tamil Nadu',
      ngo: 'Ocean Revival NGO',
      location: 'Tamil Nadu, India',
      coordinates: { lat: 9.9252, lng: 78.1198 },
      status: 'in-progress',
      progress: 60,
      carbonCredits: 180,
      targetSpecies: ['Zostera marina', 'Halophila ovalis'],
      area: 85.2,
      startDate: '2024-03-10',
      lastUpdate: '2024-09-01',
      totalFunding: 1800000,
      description: 'Seagrass meadow restoration with focus on marine biodiversity enhancement.',
      iotSensors: 8,
      dataPoints: 5420
    },
    {
      id: 'BC-003',
      title: 'Salt Marsh Restoration - Gujarat',
      ngo: 'Coastal Care Society',
      location: 'Gujarat, India',
      coordinates: { lat: 22.2587, lng: 71.1924 },
      status: 'pending-verification',
      progress: 40,
      carbonCredits: 95,
      targetSpecies: ['Salicornia brachiata', 'Suaeda maritima'],
      area: 67.8,
      startDate: '2024-05-20',
      lastUpdate: '2024-08-15',
      totalFunding: 1200000,
      description: 'Salt marsh ecosystem restoration in the Rann of Kutch region.',
      iotSensors: 6,
      dataPoints: 2890
    }
  ],
  pendingProjects: [
    {
      id: 'BC-004',
      title: 'Kelp Forest Restoration - Kerala',
      ngo: 'Marine Life Protectors',
      location: 'Kerala, India',
      status: 'under-review',
      submittedDate: '2024-09-05',
      estimatedArea: 45.3,
      targetCredits: 200
    }
  ],
  verifyProject: (id) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, status: 'verified' } : p
    )
  })),
  rejectProject: (id, remarks) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, status: 'rejected', remarks } : p
    )
  }))
}));

export { useProjectStore };