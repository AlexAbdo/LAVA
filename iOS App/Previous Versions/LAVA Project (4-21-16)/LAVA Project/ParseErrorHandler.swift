//
//  ParseErrorHandlerController.swift
//  LAVA Project
//
//  Created by Alex Abdo on 4/5/16.
//  Copyright © 2016 Alex Abdo. All rights reserved.
//

import Foundation
import Parse


class ParseErrorHandler {
    class func handleParseError(error: NSError) {
        if error.domain != PFParseErrorDomain {
            return
        }
        
        switch (error.code) {
        case PFErrorCode.ErrorInvalidSessionToken.rawValue:
            handleInvalidSessionTokenError()
        // Other Parse API Errors that you want to explicitly handle.
        
        default:
            break
        }
    }
    
private class func handleInvalidSessionTokenError() {
            //--------------------------------------
            // Option 1: Show a message asking the user to log out and log back in.
            //--------------------------------------
            // If the user needs to finish what they were doing, they have the opportunity to do so.
            //
    let alertMsg = UIAlertController(
        title: "Invalid Session",
        message: "Session is no longer valid, please log out and log in again.",
        preferredStyle: UIAlertControllerStyle.Alert)
    
    let cancelAction = UIAlertAction(title: "Not Now", style: .Cancel) { (action) -> Void in
        alertMsg.dismissViewControllerAnimated(true, completion: nil)
    }
    
    let okAction = UIAlertAction(title: "OK", style: .Default) { (action) -> Void in
        PFUser.logOut()
        // Log in User
        PFUser.logInWithUsernameInBackground("test13", password:"abc") {
            (user: PFUser?, error: NSError?) -> Void in
            if user != nil {
                // Do stuff after successful login.
                print("User login success!")
            } else {
                print("User login failed")
                // The login failed. Check error to see why.
            }
        }
    }
    
    alertMsg.addAction(cancelAction)
    alertMsg.addAction(okAction)
    
    let viewctrl = ViewController()
    
    viewctrl.presentViewController(alertMsg, animated: true) {
        print("alert shown")
    }
    
    
    
            //--------------------------------------
            // Option #2: Show login screen so user can re-authenticate.
            //--------------------------------------
            // You may want this if the logout button is inaccessible in the UI.
            //
            // let presentingViewController = UIApplication.sharedApplication().keyWindow?.rootViewController
            // let logInViewController = PFLogInViewController()
            // presentingViewController?.presentViewController(logInViewController, animated: true, completion: nil)
    }
}
//    // In all API requests, call the global error handler, e.g.
//    let query = PFQuery(className: "User")
//    query.findObjectsInBackgroundWithBlock { (objects: [AnyObject]!, error: NSError!) -> Void in
//    if error == nil {
//    // Query Succeeded - continue your app logic here.
//    } else {
//    // Query Failed - handle an error.
//    ParseErrorHandlingController.handleParseError(error)
//    }
