# CrewAI

## Define Agents & Tasks
```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role='Research Analyst',
    goal='Find comprehensive information on the topic',
    backstory='Expert researcher with access to web search',
    tools=[search_tool],
    llm=llm,
)

writer = Agent(
    role='Content Writer',
    goal='Write engaging content based on research',
    backstory='Experienced technical writer',
    llm=llm,
)

research_task = Task(description='Research {topic}', agent=researcher, expected_output='Research report')
write_task = Task(description='Write article from research', agent=writer, expected_output='Blog post', context=[research_task])

crew = Crew(agents=[researcher, writer], tasks=[research_task, write_task], verbose=True)
result = crew.kickoff(inputs={'topic': 'AI agents'})
```

## Process types: sequential, hierarchical (manager delegates)
## Memory, callbacks, custom tools
