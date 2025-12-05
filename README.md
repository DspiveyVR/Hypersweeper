Spencer tutorial

run `git clone https://github.com/DspiveyVR/Hypersweeper`

create a new branch based on main by running `git checkout -b branch-name`

run `git add --all` whenever you create new files

run `git commit -a -m "message"` to commit

run `git push`

run the program by going into terminal and type:

`python -m http.server 8000`

then open http://localhost:8000/ in your browser

you'll have to refresh the browser when you make changes.  also i recommend opening developer console in your browser, go to network tab and
check disable cache because sometimes this will cause your changes to not apply. 

you can add new themes by adding them to the themes constant in Board.js.  Just name the folders in CamelCase like i did.  I'll add a way to 
switch themes in game later but rn you just do it in code.

also name your sprites in the folders mine.png and flag.png like i did and use similar names with no spaces if you make other types of sprites.

main thing I want you to do is work on CSS to make it not so ugly and you can also change the colors and stuff in the draw function.

there's still more stuff i need to add but i think its good for both of us to work on it now and it won't conflict severely