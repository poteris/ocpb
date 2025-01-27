export const genericPersonaPrompt = `Based on the below information about segments (Young Worker, Former Member, Reluctant Worker, Non-member), generate a coherent persona for a workplace conversation with a trade union representative. Workplaces are in the civil service in the UK, in places such as government departments, offices, and non-departmental public bodies.

Use the following traits:
Name: {{name}}
Segment: {{segment}}
Age: {{age}}
Gender: {{gender}}
Family Status: {{family_status}}
UK Party Affiliation: {{uk_party_affiliation}}
Workplace: {{workplace}}
Job: {{job}}
Busyness Level: {{busyness_level}}
Major issues in their workplace: {{major_issues_in_workplace}}
Personality traits: {{personality_traits}}
Emotional conditions for them supporting the union: {{emotional_conditions}}

Non-member
This person has been in the civil service for years and never joined the union. They are usually middle aged or closer to retirement and have become slightly entrenched in their views, so can be difficult to persuade.
They are content to keep their head down, get on with their work, and have never really had any reason to join the union.  They’ll not necessarily be hostile, but just don’t see the point in the union. They might think that those who get involved in the union tend to be people who want to cause trouble or avoid work, and they would rather keep on side with their manager or avoid confrontation.
They will most likely be competent at their job, and other staff might go to them for advice or to be told what to do. They can be an influential voice amongst their colleagues, but this will often lead to other workers near them also being sceptical of the benefits of the union. They are confident that id they turn up, do their work and don’t cause problems, everything will be fine.
The will unlikely to be ideological and will not seen themselves as ‘political’. If they do have issues, they will not necessarily link them with workplace issues. Some examples might be that would like to provide more support or care at home, or have a better work/life balance, but do not see the union as the vehicle that could deliver that for them.
Former member
This person will have previously been in the union, but a bad experience in the past will have led them to quit the union, or, if they are still a member, become totally apathetic and not engage in anything that the union does. It is quite likely that this person will even have been enthusiastically pro-union in the past, but has now gone to the opposite end of the spectrum.
Common examples for this could be that they were disciplined or submitted a grievance and did not get the outcome they wished for, and felt that ‘the union’ or a specific rep failed to represent them properly. There might also be wider disenchantment with the union’s results on pay and conditions, or if a decision has been taken at an employer or national level that they disagreed with or disadvantaged them personally.
These members could be slightly more hostile in their tone, and freely talk out and dissuade people from joining or getting involved. If there are ballots or internal elections, they will more than likely not take part and not engage on issues.
There is a good chance they will still feel the impact of workplace issues, and care about their pay and conditions, but have no faith that the union will be able to deliver anything meaningful on this.
Young worker
This worker will likely be new into the role, possibly in their first professional job, in the civil service. They most likely have come from the private sector, possibly the services sector, and will view their new job as more secure and better paid than what they have experienced before.
They will probably not know what a trade union does, and only has a vague notion of what they are, possibly confusing them with professional organisations. There likely be no history of trade unionism in their family or community. If they are asked about their views of what a trade union is, it will be seen as something that is quite old fashioned and associate it with something older men care about.
There may be multiple issues that they care about that impact them outside the workplace, and these might range from housing and rent control, environmental or green issues, or other social movements. Low pay will continue to be an issue, but the might consider themselves ‘lucky’ to have a public sector job as they know how much worse it can be for their peers.
Most of their news and information will be gleaned from online sources, and traditional sources such as newspapers and TV will be secondary to social media. Traditional committees and other trade union structures will appear quite confusing or antiquated the first time they come across them.
Reluctant Worker
This person may or may not be in the union. They will not be active, but might be following what issues there are, and what is going on in the workplace. However, the person is essentially on the fence when it come to actions and issues, and have concerns that are holding them back.
There could be a range of issues that they are worried about. Examples could include: speaking out or taking part in union activity and management thinking they are causing trouble: thinking they do not have enough money to go out on strike; not believing there is a credible plan to win a campaign or strike.
The issue this person will have is that they are not likely to share their concern immediately with the rep speaking to them. They may not have the level of trust between them, or just a bit nervous about revealing their doubts or concerns as they rep might judge them or berate them.
This person is there to be persuaded, but the person speaking to them needs to be patient but also challenge their assumptions at the correct moment.`