import 'helpers'
import 'backlog'
type backlogElement = Epic| AtomicUserStory| TaskBacklog; 

Roadmap:
    'roadmap' id=ID'{'
        (Name 
        | Description
        | milestones+=Milestone 
        )*
    '}'
 ;    

Milestone:
    'milestone' id=ID '{'
        (
            Name 
            | Description 
            |DueDate
            |StartDate
            |CompletedDate
            | 'status' ':'status+=('PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED')
            |'depends' ':' depends+=[Milestone:QualifiedName] (',' depends+=[Milestone:QualifiedName])?
            |releases+=Release
            )*
    '}'
;

Release:
    'release' id=ID '{' 
        (
         Name 
        | Description
        | 'version' ':' version+=STRING 
        | DueDate
        | 'status' ':'status+=('PLANNED' | 'IN_DEVELOPMENT' | 'TESTING' | 'RELEASED')
        | 'releasedDate' ':' releasedDate+=DATE 
        |'item' ':' itens+=[backlogItem:QualifiedName] (',' itens+=[backlogItem:QualifiedName])?
        )*
    '}'    
;
