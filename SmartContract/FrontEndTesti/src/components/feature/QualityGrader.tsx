import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Material } from '../../types';
import { QUALITY_GRADES } from '../../utils/constants';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface QualityGraderProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material;
  onGrade: (grade: 'A' | 'B' | 'C' | 'D', feedback: string) => void;
}

const QualityGrader: React.FC<QualityGraderProps> = ({
  isOpen,
  onClose,
  material,
  onGrade
}) => {
  const [selectedGrade, setSelectedGrade] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradeOptions = Object.entries(QUALITY_GRADES).map(([grade, info]) => ({
    grade: grade as 'A' | 'B' | 'C' | 'D',
    label: info.label,
    multiplier: info.multiplier,
    icon: getGradeIcon(grade),
    color: getGradeColor(grade)
  }));

  function getGradeIcon(grade: string) {
    switch (grade) {
      case 'A': return <CheckCircle className="h-5 w-5" />;
      case 'B': return <Star className="h-5 w-5" />;
      case 'C': return <AlertCircle className="h-5 w-5" />;
      case 'D': return <XCircle className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  }

  function getGradeColor(grade: string) {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrade) return;

    setIsSubmitting(true);
    try {
      onGrade(selectedGrade, feedback);
      onClose();
    } catch (error) {
      console.error('Error submitting grade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quality Grading"
      size="lg"
    >
      <div className="space-y-6">
        {/* Material Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Material Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{material.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{material.subcategory}</span>
            </div>
            <div>
              <span className="text-gray-600">Weight:</span>
              <span className="ml-2 font-medium">{material.weight} kg</span>
            </div>
            <div>
              <span className="text-gray-600">Condition:</span>
              <span className="ml-2 font-medium capitalize">{material.condition}</span>
            </div>
          </div>
        </div>

        {/* Images */}
        {material.photos.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Material Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {material.photos.slice(0, 6).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${material.name} ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grade Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Quality Grade
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gradeOptions.map((option) => (
                <div
                  key={option.grade}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedGrade === option.grade
                      ? `${option.color} border-current`
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedGrade(option.grade)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedGrade === option.grade}
                      onChange={() => setSelectedGrade(option.grade)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <div className={`p-2 rounded-full ${option.color}`}>
                      {option.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Grade {option.grade}
                      </div>
                      <div className="text-sm text-gray-500">
                        {option.label}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {option.multiplier}x price multiplier
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality Assessment Notes
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Provide detailed feedback on the material quality, condition, and any recommendations..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1"
              disabled={!selectedGrade}
            >
              Submit Grade
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default QualityGrader;