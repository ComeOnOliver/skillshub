# AutoGen

## Two-Agent Chat
```python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent("assistant", llm_config={"model": "gpt-4o"})
user_proxy = UserProxyAgent("user", human_input_mode="NEVER", code_execution_config={"work_dir": "output"})

user_proxy.initiate_chat(assistant, message="Create a plot of AAPL stock price for the last month")
```

## Group Chat
```python
from autogen import GroupChat, GroupChatManager

coder = AssistantAgent("coder", system_message="Write Python code")
reviewer = AssistantAgent("reviewer", system_message="Review code for bugs")
group = GroupChat(agents=[user_proxy, coder, reviewer], messages=[], max_round=10)
manager = GroupChatManager(groupchat=group, llm_config=llm_config)
user_proxy.initiate_chat(manager, message="Build a REST API")
```

## Features: code execution, tool use, human-in-the-loop, nested chats
