# Changelog:  
    7.8.0:
        Changes:  changes in webdriverio reporting broke the cucumber support.
                   handlebars is not capable of supporting the recursion needed to 
                   render a suite that contains suites.
                   Had to switch to numjucks to have cucumber work.
                   As a result you can no longer supply your own template file.
    7.7.15:
        Bugfix: remove @wdio/types  
    7.7.14:
        Bugfix: catch json write error  

     7.7.13:

        Bugfix: update to webdriverio 7.7.6, fix compile fail  
    
        Bugfix: webdriverio 7.7.4 event structure was changed, update to match. caused assertion display to fail  
    
        Bugfix: fix file case error in copyFiles  
    
        Bugfix: cleanup async behaviour of createReport    
    
        Bugfix: fix start time setting
        
        Totally rewritten in typescript.
        
        No more jquery, uses only vanilla js
    
        No more moment.js dependency
    
        use 'html-nice' for reporter definition
        
        Removed need for global scope reportAggregator in client code
    
        Add collapseTests and collapseSuites options,default to false
    
        sort suites by time order
        
        display spec file in suite header