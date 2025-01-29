
import ReactMarkdown from 'react-markdown';
import { markdownStyles } from '@/utils/markdownStyles';
import {TrainingScenario} from '@/types/scenarios';
interface ScenarioDescriptionProps {
    scenario: TrainingScenario;
}

const  ScenarioDescription: React.FC<ScenarioDescriptionProps> = ({ scenario }) => {
    return (
        <div>
            <section className="mb-12">
                <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    Scenario Description
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">{scenario?.description}</p>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Objectives</h2>
                <div className="text-lg text-gray-700 dark:text-gray-300 space-y-4">
                    {scenario?.objectives.map((objective, index) => (
                        <div key={index} className="mb-4">
                            <ReactMarkdown components={markdownStyles}>{objective}</ReactMarkdown>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};


export default ScenarioDescription;