'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Alert from '@/components/ui/Alert'

const certificationOptions = [
  { value: 'cert1', label: 'Certification #1' },
  { value: 'cert2', label: 'Certification #2' },
  { value: 'cert3', label: 'Certification #3' },
  { value: 'cert4', label: 'Certification #4' },
  { value: 'cert5', label: 'Certification #5' }
]

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    certification: ''
  })
  const [alert, setAlert] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password || !formData.certification) {
      setAlert({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    setIsSubmitting(true)
    
    console.log('Register Form Data:', formData)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setAlert({ type: 'success', message: 'Registration form submitted successfully!' })
      
      setTimeout(() => {
        setAlert(null)
        setFormData({ name: '', email: '', password: '', certification: '' })
      }, 2000)
    }, 1000)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our platform and start collecting data
          </p>
        </div>
        
        {alert && (
          <Alert 
            message={alert.message} 
            type={alert.type} 
            onClose={() => setAlert(null)}
          />
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>
            
            <div>
              <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">
                Certification
              </label>
              <Select
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                options={certificationOptions}
                placeholder="Select a certification"
                required
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}