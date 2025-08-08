'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import RadioGroup from '@/components/ui/RadioGroup'
import Textarea from '@/components/ui/Textarea'
import Alert from '@/components/ui/Alert'

const experienceOptions = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (3-5 years)' },
  { value: 'advanced', label: 'Advanced (6-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' }
]

const satisfactionOptions = [
  { value: '1', label: 'Very Dissatisfied' },
  { value: '2', label: 'Dissatisfied' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Satisfied' },
  { value: '5', label: 'Very Satisfied' }
]

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'never', label: 'Never' }
]

export default function Survey() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    experience: '',
    satisfaction: '',
    frequency: '',
    favoriteFeature: '',
    suggestions: '',
    recommendation: ''
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
    
    const requiredFields = ['fullName', 'email', 'age', 'experience', 'satisfaction', 'frequency']
    const emptyFields = requiredFields.filter(field => !formData[field])
    
    if (emptyFields.length > 0) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' })
      return
    }

    setIsSubmitting(true)
    
    console.log('Survey Form Data:', formData)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setAlert({ type: 'success', message: 'Survey submitted successfully! Thank you for your feedback.' })
      
      setTimeout(() => {
        setAlert(null)
        setFormData({
          fullName: '',
          email: '',
          age: '',
          experience: '',
          satisfaction: '',
          frequency: '',
          favoriteFeature: '',
          suggestions: '',
          recommendation: ''
        })
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              User Experience Survey
            </h2>
            <p className="text-gray-600">
              Help us improve our platform by sharing your experience and feedback
            </p>
          </div>
          
          {alert && (
            <Alert 
              message={alert.message} 
              type={alert.type} 
              onClose={() => setAlert(null)}
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                min="18"
                max="100"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <Select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                options={experienceOptions}
                placeholder="Select your experience level"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Overall Satisfaction *
              </label>
              <RadioGroup
                name="satisfaction"
                options={satisfactionOptions}
                value={formData.satisfaction}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How often do you use similar platforms? *
              </label>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                options={frequencyOptions}
                placeholder="Select frequency"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s your favorite feature? (Optional)
              </label>
              <Input
                type="text"
                name="favoriteFeature"
                value={formData.favoriteFeature}
                onChange={handleChange}
                placeholder="Tell us about your favorite feature"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for Improvement (Optional)
              </label>
              <Textarea
                name="suggestions"
                value={formData.suggestions}
                onChange={handleChange}
                placeholder="Share your suggestions to help us improve..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Would you recommend our platform? (Optional)
              </label>
              <RadioGroup
                name="recommendation"
                options={[
                  { value: 'yes', label: 'Yes, definitely' },
                  { value: 'maybe', label: 'Maybe' },
                  { value: 'no', label: 'No, not likely' }
                ]}
                value={formData.recommendation}
                onChange={handleChange}
              />
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting Survey...' : 'Submit Survey'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}