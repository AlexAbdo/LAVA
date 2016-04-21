//
//  ViewController.swift
//  LAVA Project
//
//  Created by Alex Abdo on 3/1/16.
//  Copyright © 2016 Alex Abdo. All rights reserved.
//

import UIKit
import CoreLocation
import Parse

class ViewController: UIViewController, CLLocationManagerDelegate {
    
    // MARK: Properties
    @IBOutlet weak var currLat: UILabel!
    @IBOutlet weak var currLong: UILabel!
    @IBOutlet weak var currTime: UILabel!
    
    
    
    // Create CLLocationManager object
    var locationManager: CLLocationManager = CLLocationManager()
    var phoneLocation: CLLocation!
    var currLoc: CLLocationCoordinate2D!
    
    // Create date object and settings
    var dateFormatter: NSDateFormatter = NSDateFormatter()
    
    var curruser = PFUser.currentUser()
    var mobup = PFObject()
    

    
    override func viewDidLoad() {
        super.viewDidLoad()



//        let testObject = PFObject(className: "TestObject")
//        testObject["foo"] = "bar"
//        testObject.saveInBackgroundWithBlock { (success: Bool, error: NSError?) -> Void in
//            print("Object has been saved.")
//        }
        
        print("view loaded")
        
        // Request Location Permission from User
        if CLLocationManager.authorizationStatus() == .NotDetermined {
            locationManager.requestAlwaysAuthorization()
        }
        locationManager.delegate = self
        locationManager.startMonitoringSignificantLocationChanges()
        
        //locationManager.pausesLocationUpdatesAutomatically
        //locationManager.allowsBackgroundLocationUpdates
        
        // Create date formatter
        dateFormatter.locale = NSLocale.currentLocale()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssSSSS"
    }

    // MARK: Actions
    @IBAction func getManualLocation(sender: UIButton) {
        print("manual location update")
        locationManager.requestLocation()
    }
    
    // MARK: CLLocationManagerDelegate
    func locationManager(manager: CLLocationManager, didUpdateLocations location: [CLLocation]) {
        print(locationManager.location)
        
        currLoc = locationManager.location?.coordinate

        if currLoc == nil {
            print("nil")
        } else {
            print("not nil")
        }
        
        currLat.text = String(format: "%.6f", currLoc.latitude)
        print("currLat", currLat.text)
        currLong.text = String(format: "%.6f", currLoc.longitude)
        print("currLong", currLong.text)
        currTime.text = dateFormatter.stringFromDate((locationManager.location?.timestamp)!)
        print("location updated")
        
        
        // Update Parse and add to iOS data table
        addLocationToTable()
    }
    
    func locationManager(manager: CLLocationManager, didFailWithError error: NSError) {
        print("failed to get location")
    
    }
    
    func loginUser() {
        print("loginuser called")
        // Log in User
        do {
            try PFUser.logInWithUsername("test1", password: "abc")
            print("User login SUCCEEDED")
        }
        catch {
            print("User login failed")
        }

        if PFUser.currentUser() == nil {
            print("User login failed even after 'logging in'")
        } else {
            curruser = PFUser.currentUser()
        }
        
        
//        PFUser.logInWithUsernameInBackground("test1", password:"abc") {
//            (user: PFUser?, error: NSError?) -> Void in
//            if user != nil {
//                // Do stuff after successful login.
//                print("User login success!")
//                self.curruser = user
//                
//            } else {
//                print("User login failed")
//                // The login failed. Check error to see why.
//            }
//        }
    }
    
    func addLocationToTable() {
        if curruser == nil {
            print("user is nil in addlocation")
            loginUser()
        }
        
        do {
            let numUpdated = try PFQuery.getObjectOfClass("MobUp", objectId: curruser!.objectId!)
            
            numUpdated.incrementKey("numTimesUpdated")
            
            do {
                try numUpdated.save()
            } catch {
                print("failed to save numTimesUpdated to MobUp class")
            }
            
        } catch {
            print("could not find object of MobUp class")
        }

        curruser!["mLat"] = Float(currLoc.latitude)
        curruser!["mLon"] = Float(currLoc.longitude)
        curruser!["mobileUpdatedAt"] = dateFormatter.dateFromString(currTime.text!)
        curruser?.saveInBackground()
        print("added")
    }
}

