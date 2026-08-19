Akses : https://content-plan-rho.vercel.app


const DEFAULT_PASSWORD = 'password123'

const usersToCreate = [
  { email: 'superadmin@app.com', role: 'super_admin', name: 'Super Admin' },
  { email: 'mediaadmin@app.com', role: 'media_admin', name: 'Media Admin' },
  { email: 'pimpinan@app.com', role: 'pimpinan', name: 'Pimpinan Yayasan' },
  { email: 'tk@app.com', role: 'lembaga_admin', name: 'Admin TK', lembagaName: 'TK' },
  { email: 'sd@app.com', role: 'lembaga_admin', name: 'Admin SD', lembagaName: 'SD' },
  { email: 'smp@app.com', role: 'lembaga_admin', name: 'Admin SMP', lembagaName: 'SMP' },
  { email: 'smkdp1@app.com', role: 'lembaga_admin', name: 'Admin SMK DP1', lembagaName: 'SMK DP1' },
  { email: 'smkdp2@app.com', role: 'lembaga_admin', name: 'Admin SMK DP2', lembagaName: 'SMK DP2' },
]