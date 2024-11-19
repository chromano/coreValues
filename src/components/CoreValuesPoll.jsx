import React, { useState, useEffect } from 'react';
import { Search, Calendar, Info, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';

// Custom hook for local storage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

const CoreValuesPoll = () => {
  const [selectedValues, setSelectedValues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [polls, setPolls] = useLocalStorage('coreValuesPolls', []);
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  // Value interactions definitions
  const valueInteractions = {
    conflicts: {
      "Achievement": ["Balance", "Peace"],
      "Adventure": ["Security", "Stability"],
      "Authority": ["Autonomy", "Peace"],
      "Wealth": ["Spirituality", "Inner Harmony"],
      "Status": ["Authenticity", "Inner Harmony"],
      "Fame": ["Peace", "Inner Harmony"],
      "Balance": ["Achievement", "Challenge"],
      "Security": ["Adventure", "Risk"],
      "Inner Harmony": ["Status", "Fame"],
    },
    synergies: {
      "Growth": ["Learning", "Challenge", "Wisdom"],
      "Compassion": ["Service", "Kindness"],
      "Leadership": ["Influence", "Responsibility"],
      "Wisdom": ["Knowledge", "Growth"],
      "Learning": ["Curiosity", "Growth"],
      "Service": ["Contribution", "Compassion"],
      "Community": ["Friendships", "Citizenship"],
      "Knowledge": ["Learning", "Wisdom"],
      "Honesty": ["Trustworthiness", "Authenticity"],
    }
  };

  const coreValues = {
    "Authenticity": "Being true to oneself and one's beliefs; genuine self-expression",
    "Achievement": "Accomplishing goals and reaching desired outcomes through effort",
    "Adventure": "Seeking new experiences and embracing the unknown",
    "Authority": "Having the power to direct or influence others' behavior",
    "Autonomy": "Independence and freedom to make one's own choices",
    "Balance": "Maintaining harmony between different aspects of life",
    "Beauty": "Appreciation for aesthetic pleasure and artistry",
    "Boldness": "Willingness to take risks and act with courage",
    "Compassion": "Feeling and acting with empathy toward others' suffering",
    "Challenge": "Pursuing difficult tasks that test one's abilities",
    "Citizenship": "Active participation in community and civic duties",
    "Community": "Connection to and involvement with a group or society",
    "Competency": "Having the skills and knowledge to perform effectively",
    "Contribution": "Making a positive impact on others or society",
    "Creativity": "Generating original ideas and expressing innovation",
    "Curiosity": "Desire to learn, explore, and understand new things",
    "Determination": "Perseverance in pursuing goals despite obstacles",
    "Fairness": "Treating others with impartiality and justice",
    "Faith": "Strong belief in a higher power or spiritual principles",
    "Fame": "Being widely known and recognized by others",
    "Friendships": "Cultivating meaningful personal relationships",
    "Fun": "Experiencing joy and playfulness in life",
    "Growth": "Continuous personal development and improvement",
    "Happiness": "Experiencing contentment and well-being",
    "Honesty": "Being truthful and sincere in words and actions",
    "Humor": "Finding and expressing amusement in life",
    "Influence": "Having an impact on others' thoughts or actions",
    "Inner Harmony": "Peace and balance within oneself",
    "Justice": "Upholding what is morally right and fair",
    "Kindness": "Showing genuine care and consideration for others",
    "Knowledge": "Acquiring understanding and information",
    "Leadership": "Guiding and inspiring others toward goals",
    "Learning": "Continuously acquiring new skills and insights",
    "Love": "Deep affection and care for others",
    "Loyalty": "Faithful commitment to people, groups, or principles",
    "Meaningful Work": "Engaging in purposeful and fulfilling activities",
    "Openness": "Being receptive to new ideas and experiences",
    "Optimism": "Maintaining a positive outlook on life",
    "Peace": "Tranquility and freedom from conflict",
    "Pleasure": "Pursuit of enjoyment and satisfaction",
    "Poise": "Maintaining composure and dignity",
    "Popularity": "Being well-liked by many people",
    "Recognition": "Acknowledgment of one's achievements or qualities",
    "Religion": "Dedication to specific religious beliefs and practices",
    "Reputation": "How one is perceived by others",
    "Respect": "Showing consideration and regard for others",
    "Responsibility": "Being accountable for one's actions and obligations",
    "Security": "Feeling safe and free from threat or uncertainty",
    "Self-Respect": "Maintaining dignity and pride in oneself",
    "Service": "Helping others and contributing to society",
    "Spirituality": "Connection to something greater than oneself",
    "Stability": "Maintaining consistency and reliability in life",
    "Success": "Achieving desired outcomes and goals",
    "Status": "Social standing or position in society",
    "Trustworthiness": "Being reliable and worthy of others' confidence",
    "Wealth": "Accumulation of material resources and financial security",
    "Wisdom": "Deep understanding and good judgment gained from experience"
  };

  const getValueInteractions = () => {
    const interactions = {
      conflicts: [],
      synergies: []
    };

    selectedValues.forEach((value1, index) => {
      selectedValues.slice(index + 1).forEach(value2 => {
        if (valueInteractions.conflicts[value1]?.includes(value2) ||
            valueInteractions.conflicts[value2]?.includes(value1)) {
          interactions.conflicts.push([value1, value2]);
        }
        if (valueInteractions.synergies[value1]?.includes(value2) ||
            valueInteractions.synergies[value2]?.includes(value1)) {
          interactions.synergies.push([value1, value2]);
        }
      });
    });

    return interactions;
  };

  const getValueFrequency = () => {
    const frequency = {};
    Object.keys(coreValues).forEach(value => {
      frequency[value] = polls.filter(poll => 
        poll.values.includes(value)
      ).length;
    });
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 0)
      .map(([value, count]) => ({
        value,
        count,
        percentage: ((count / polls.length) * 100).toFixed(1)
      }));
  };

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else if (selectedValues.length < 10) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const submitPoll = () => {
    if (selectedValues.length === 10) {
      const newPoll = {
        date: new Date().toLocaleDateString(),
        values: [...selectedValues],
        timestamp: new Date().getTime()
      };
      setPolls([...polls, newPoll]);
      setSelectedValues([]);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all your poll history? This cannot be undone.')) {
      setPolls([]);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(polls, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `core-values-history-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPolls = JSON.parse(e.target.result);
          if (Array.isArray(importedPolls)) {
            if (window.confirm('This will replace your current poll history. Continue?')) {
              setPolls(importedPolls);
            }
          } else {
            alert('Invalid file format');
          }
        } catch (error) {
          alert('Error reading file');
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredValues = Object.keys(coreValues).filter(value =>
    value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coreValues[value].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentInteractions = getValueInteractions();

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Core Values Poll
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search values or descriptions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <span>Selected: {selectedValues.length}/10 values</span>
                <Button 
                  onClick={submitPoll} 
                  disabled={selectedValues.length !== 10}
                >
                  Submit Poll
                </Button>
              </AlertDescription>
            </Alert>
          </div>

          {selectedValues.length > 1 && (
            <div className="mb-6 space-y-4">
              {currentInteractions.conflicts.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Potential Value Conflicts:</div>
                    <ul className="list-disc pl-4">
                      {currentInteractions.conflicts.map(([v1, v2], index) => (
                        <li key={`conflict-${index}`} className="text-sm">
                          {v1} <ArrowRight className="inline h-3 w-3" /> {v2}
                          <div className="text-xs opacity-75">
                            May require careful balance and conscious trade-offs
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {currentInteractions.synergies.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <Info className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-medium mb-1 text-green-800">Value Synergies:</div>
                    <ul className="list-disc pl-4">
                      {currentInteractions.synergies.map(([v1, v2], index) => (
                        <li key={`synergy-${index}`} className="text-sm text-green-800">
                          {v1} <ArrowRight className="inline h-3 w-3" /> {v2}
                          <div className="text-xs opacity-75">
                            These values naturally reinforce each other
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredValues.map((value) => (
              <div 
                key={value}
                className="relative"
                onMouseEnter={() => setHoveredValue(value)}
                onMouseLeave={() => setHoveredValue(null)}
              >
                <Button
                  variant={selectedValues.includes(value) ? "default" : "outline"}
                  className="w-full text-sm justify-between group"
                  onClick={() => toggleValue(value)}
                >
                  <span>{value}</span>
                  <Info className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                </Button>
                {hoveredValue === value && (
                  <div className="absolute z-10 p-2 bg-white border rounded-md shadow-lg mt-1 text-sm w-full">
                    {coreValues[value]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedValues.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Current Selection:</h3>
              <ol className="list-decimal pl-4">
                {selectedValues.map((value) => (
                  <li key={value} className="mb-2">
                    <span className="font-medium">{value}</span>
                    <br />
                    <span className="text-sm text-gray-600">{coreValues[value]}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {showHistory && (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Your Value History
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-file').click()}
                >
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportData}
                >
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearHistory}
                >
                  Clear History
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {polls.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No polls recorded yet. Start by selecting your values above!
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Value Frequency</h3>
                  <div className="space-y-2">
                    {getValueFrequency().map(({ value, count, percentage }) => (
                      <div key={value} className="flex items-center gap-2">
                        <div className="w-32 truncate" title={value}>{value}</div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-20 text-sm text-gray-600">
                          {count}/{polls.length} ({percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Poll History</h3>
                  {polls.map((poll, index) => (
                    <div key={poll.timestamp} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            Poll #{polls.length - index}: {poll.date}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            if (window.confirm('Delete this poll?')) {
                              setPolls(polls.filter(p => p.timestamp !== poll.timestamp));
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                      <ol className="list-decimal pl-4">
                        {poll.values.map((value) => (
                          <li key={value} className="mb-2">
                            <span className="font-medium">{value}</span>
                            <br />
                            <span className="text-sm text-gray-600">{coreValues[value]}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoreValuesPoll;