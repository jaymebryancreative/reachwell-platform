# Reachwell Communication System

## Connected conversations

### Organization announcements
Broadcasts for authorized organization-wide notices with audience targeting and read state.

### Team channels
Every team may have a dedicated channel. Team leaders manage membership and authorized posting settings.

### Event channels
Events can have their own conversations connected to the roster and setup team.

### Workspace discussions
Projects and tasks can carry contextual discussion rather than forcing users to leave their work.

### Direct and group messages
Authorized users can start person-to-person or group conversations. Access must always be organization-scoped.

## Required capabilities
- Conversation history
- Search
- Read/unread state
- Notifications
- Mentions
- Attachments through authorized storage
- Permission-aware membership
- Communication history surfaced from authorized profiles
- Event/team/project context

## Email
The UI must distinguish composing an email from delivering an email. Production delivery requires a configured provider, sender identity, consent/preferences where applicable, delivery status, and a communication record.

## Data and security
Messages and recipients must be organization-scoped. Sensitive profile notes are not automatically exposed in communication. Production policies must enforce authorization server-side.
