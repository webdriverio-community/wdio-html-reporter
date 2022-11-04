# Changelog: 
    8.0.6:
        Protect against missing video file if nunjucks html generation
    8.0.5:
        Protect against missing image file if nunjucks html generation
    8.0.4:
        Total rework to remove issue with webdriverio cutting off the report generation
        (https://github.com/rpii/wdio-html-reporter/issues/86)
    8.0.3:
        further fixes to async json write in html reporter.
        (https://github.com/rpii/wdio-html-reporter/issues/86)
    8.0.2:
        further fix to async json write in html reporter.
        (https://github.com/rpii/wdio-html-reporter/issues/86)
    8.0.1:
        async json write was not awaited correctly and could be missed.
        (https://github.com/rpii/wdio-html-reporter/issues/86)
    8.0.0:
        major fix for out of memory errors --thanks to (https://github.com/owens-ben)
        (https://github.com/rpii/wdio-html-reporter/issues/84)
    7.9.2:
        Security Update: log4js 
        add default for report options:
            collapseTests = false ;
            collapseSuites = false ;
    7.9.1:
        Feature: [Add support for taking videos of each test] 
                    See sample/wdio.config.ts for configuration. 
                    Requires updated or patched wdio-video-reporter
                    (https://github.com/rpii/wdio-video-reporter)

    7.9.0:
        Bugfix: [Address duplicate tests and suites being displayed when using nested suites #74] 
        (https://github.com/rpii/wdio-html-reporter/issues/74)
        
    7.8.7:
        Bugfix: [Address issues caused by JSON.stringify running out of string memory.  Now saves screenshots as links to drastically reduce menory usage #71])(https://github.com/rpii/wdio-html-reporter/pull/71)
        set reporterOption linkScreenshots:true

    7.8.5:
        Bugfix: [Fixes empty Assertion block due to AssertionError #71])(https://github.com/rpii/wdio-html-reporter/pull/71)

    7.8.4:
        Feature: [add logic to show/hide failed/passed tests #69])(https://github.com/rpii/wdio-html-reporter/pull/69)
    7.8.3:
        Bugfix: [Fix logic for 'expandable-control' elements 'click' event #6])(https://github.com/rpii/wdio-html-reporter/pull/68)

    7.8.1:
        Cleanup: update dependencies, remove cucumber warning 
        Add note on how to resolve the multiple types ts error
    7.8.0:
        Changes:  changes in webdriverio reporting broke the cucumber support.
                   handlebars is not capable of supporting the recursion needed to 
                   render a suite that contains suites.
                   Had to switch to numjucks to have cucumber work.
                   As a result you can no longer supply your own template file.
                   Cucumber has nested suites in suites and duplicated data.
                   Had to work around that.
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
