const bcrypt = require('bcrypt')

async function hashPassword() {
  const password = process.argv[2]

  if (!password) {
    console.log('Masukkan password')
    return
  }

  const hash = await bcrypt.hash(password, 10)
  console.log('HASH:')
  console.log(hash)
}

hashPassword()