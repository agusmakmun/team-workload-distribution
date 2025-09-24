import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkloadData {
  memberId: string;
  memberName: string;
  activeScore: number;
  completedScore: number;
  totalScore: number;
  activeTaskCount: number;
  completedTaskCount: number;
  totalTaskCount: number;
}

interface WorkloadChartProps {
  data: WorkloadData[];
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Team Workload Distribution</CardTitle>
        <CardDescription>
          Active vs completed task scores by team member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="memberName" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis />
              <Legend 
                formatter={(value: string) => {
                  const labelMap: { [key: string]: string } = {
                    activeScore: 'Active Tasks',
                    completedScore: 'Completed Tasks'
                  };
                  return labelMap[value] || value;
                }}
                wrapperStyle={{
                  paddingTop: '20px'
                }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labelMap: { [key: string]: string } = {
                    activeScore: 'Active Tasks',
                    completedScore: 'Completed Tasks'
                  };
                  return [`${value} points`, labelMap[name] || name];
                }}
                labelFormatter={(label: string) => `Team Member: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Bar 
                dataKey="activeScore" 
                fill="#8b5cf6" 
                radius={[0, 0, 0, 0]}
                name="activeScore"
              />
              <Bar 
                dataKey="completedScore" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
                name="completedScore"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((member) => (
            <div key={member.memberId} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{member.memberName}</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>{member.activeTaskCount} active ({member.activeScore}pts)</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>{member.completedTaskCount} done ({member.completedScore}pts)</span>
                  </div>
                </div>
                <div className="font-medium text-gray-800 border-t pt-1">
                  Total: {member.totalTaskCount} tasks • {member.totalScore} points
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
