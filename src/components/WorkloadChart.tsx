import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkloadData {
  memberId: string;
  memberName: string;
  totalScore: number;
  taskCount: number;
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
          Total task scores by team member
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
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value} points`,
                  name === 'totalScore' ? 'Total Score' : name
                ]}
                labelFormatter={(label: string) => `Team Member: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Bar 
                dataKey="totalScore" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
                name="totalScore"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((member) => (
            <div key={member.memberId} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{member.memberName}</div>
              <div className="text-sm text-gray-600">
                {member.taskCount} task{member.taskCount !== 1 ? 's' : ''} • {member.totalScore} points
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
