import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface JobRequest {
  location: string;
  complexity: string;
  preferred_date: string;
  description?: string;
  customer_email: string;
}

export default function JobRequestForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobRequest>({
    location: '',
    complexity: '',
    preferred_date: '',
    description: '',
    customer_email: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: {
            location: formData.location,
            complexity: formData.complexity,
            preferred_date: new Date(formData.preferred_date).toISOString(),
            description: formData.description
          },
          customer_email: formData.customer_email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit job request');
      }

      const job = await response.json();
      toast({
        title: 'Success',
        description: `Job request submitted successfully. Job ID: ${job.id}`,
      });

      // Reset form
      setFormData({
        location: '',
        complexity: '',
        preferred_date: '',
        description: '',
        customer_email: ''
      });
      // Navigate to dashboard after successful submission
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit job request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof JobRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Job Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter job location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="complexity">Job Complexity</Label>
            <Select
              value={formData.complexity}
              onValueChange={(value) => handleChange('complexity', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select complexity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Preferred Date</Label>
            <Input
              type="date"
              id="timeframe"
              value={formData.preferred_date}
              onChange={(e) => handleChange('preferred_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter job description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">Email</Label>
            <Input
              type="email"
              id="customer_email"
              placeholder="Enter your email"
              value={formData.customer_email}
              onChange={(e) => handleChange('customer_email', e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Job Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
