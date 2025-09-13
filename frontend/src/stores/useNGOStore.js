import { create } from 'zustand';

const useNGOStore = create((set) => ({
  ngos: [
    {
      id: 'NGO-001',
      name: 'Green Coast Foundation',
      email: 'contact@greencoast.org',
      status: 'verified',
      registrationDate: '2023-11-15',
      projects: 3,
      totalCredits: 680
    },
    {
      id: 'NGO-002',
      name: 'Ocean Revival NGO',
      email: 'info@oceanrevival.in',
      status: 'verified',
      registrationDate: '2024-01-08',
      projects: 2,
      totalCredits: 280
    },
    {
      id: 'NGO-003',
      name: 'Marine Life Protectors',
      email: 'hello@marinelife.org',
      status: 'pending-verification',
      registrationDate: '2024-08-20',
      projects: 0,
      totalCredits: 0
    }
  ],
  verifyNGO: (id) => set((state) => ({
    ngos: state.ngos.map(ngo => 
      ngo.id === id ? { ...ngo, status: 'verified' } : ngo
    )
  }))
}));

export { useNGOStore };