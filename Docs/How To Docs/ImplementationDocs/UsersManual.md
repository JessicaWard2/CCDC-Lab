## How To Install and Run This Lab
1. Go to LF11A
2. On the computer labeled "Linux 1" login*
3. From the terminal cd into Documents/CCDCLabSite/CCDC-Lab
4. Then run "npm run dev".
5. This will run the website. From here you can now see the scoreboard, injects, and timer.
    You can see more about this on the website's homepage "How To" and below. 
6. The virtual machines that are used to run the services are labeled in the room and ready for teams to use with a login*.

## Website How To
1. Click on the "Competition Mode" or "Tutorial Mode".
    This will bring you to the inject page and start the timer.
![Inject Page](/public/HowTo1.png)
              
2.To answer the inject click on the link to see it. Once your team completes the inject check the box.
    To see the systems and how your score is click on the Scoreboard tab.
            You may see something like the image below.
              
![Scoreboard](/public/HowTo2.png)
        
The first box shows the services up and your teams score. The second box shows which services are up. And the last box shows the services percent up times.
    Score points by keeping services up.

Now that you understand these things, you are ready to enter the competition.
            

Good luck!


*You can get passwords from Professor Doyle, Jonah Facer, Andrew Nale, John Aaron, or Jessica Ward.

## Customization
The inject page has been designed to be updated as easy as possible. Both modes can be updated in these easy steps.
1. Find in the source code folders in the /src file either the 'CompetitionMode' or 'TutorialMode' folders.
2. Both of these folders contain pdfs with the naming convention "inject0x" and they are all pdfs and they must stay pdfs.
3. Simply swap or add new inject pdfs with the same naming convention into either of these folders.
4. You may also want to adjust the timer for these new injects and this can be done by navigating to the "Inject.js" in the "Pages" folder.
5. Under the Injects function you will find the following:
"1: { injectAddTime: 000, deadline: 000}, //Tutorial Mode" and "2: { injectAddTime: 000, deadline: 000} //Competition Mode"
6. The comments explain which mode each of these are. This function takes them as seconds, the program will eventually convert them to minutes and hours. Just add them in as seconds.

