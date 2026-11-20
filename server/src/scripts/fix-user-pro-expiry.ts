import mongoose from 'mongoose'
import { env } from '../config/env.js'

const fixUserProExpiry = async () => {
  try {
    await mongoose.connect(env.MONGO_URI)

    const users = mongoose.connection.collection('users')

    const email = process.argv[2]?.trim().toLowerCase()

    if (!email) {
      throw new Error('Please provide user email')
    }

    const user = await users.findOne({ email })

    if (!user) {
      throw new Error('User not found')
    }

    if (typeof user.proExpiresAt !== 'string') {
      console.log('proExpiresAt is already a Date or null. No change needed.')
      return
    }

    const expiryDate = new Date(user.proExpiresAt.trim())

    if (Number.isNaN(expiryDate.getTime())) {
      throw new Error('Invalid proExpiresAt date')
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { proExpiresAt: expiryDate } }
    )

    console.log('Pro expiry date successfully converted to Date.')
    console.log(expiryDate)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

fixUserProExpiry()