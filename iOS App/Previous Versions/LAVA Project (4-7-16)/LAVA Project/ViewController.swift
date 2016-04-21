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
        
        if curruser == nil {
            print("curruse is nil")
            curruser = PFUser.currentUser()
        } else {
            print("curruser not nil")
        }
        
        // Update Parse
        
        //        let intLat = Float?(currLat.text!)
        //            //Float32(currLoc.latitude)
        //        print("intLat", intLat)
        //        let intLong = Float32(currLoc.longitude)
        //        print("intLong", intLong)
        //        let date = dateFormatter.dateFromString(currTime.text!)

        
        print(currLoc, "hello")
        
        //print(currLoc.longitude)
        let x = Float32(currLoc.latitude)
        print(x)
        //let x = String(format: "%.6f", currLoc.latitude)
        curruser!["mLat"] = 5
        curruser!["mLon"] = Float(currLoc.longitude)
        curruser!["mobileUpdatedAt"] = dateFormatter.dateFromString(currTime.text!)
        curruser?.saveInBackground()
        print("added")
        
        
        
        // Update Parse and add to iOS data table
        //addLocationToTable()
    }
    
    func locationManager(manager: CLLocationManager, didFailWithError error: NSError) {
        print("failed to get location")
    
    }
    
    func addLocationToTable() {
        if curruser == nil {
            curruser = PFUser.currentUser()
        }
        
        // Update Parse

//        let intLat = Float?(currLat.text!)
//            //Float32(currLoc.latitude)
//        print("intLat", intLat)
//        let intLong = Float32(currLoc.longitude)
//        print("intLong", intLong)
//        let date = dateFormatter.dateFromString(currTime.text!)
        if currLoc == nil {
            print("nil")
        } else {
            print("not nil")
        }
        
        print(currLoc, "hello")
        
        //print(currLoc.longitude)
        let x = Float32()
        //let x = String(format: "%.6f", currLoc.latitude)
        curruser!["mLat"] = Float32(x)
        curruser!["mLon"] = Float(currLoc.longitude)
        curruser!["mobileUpdatedAt"] = dateFormatter.dateFromString(currTime.text!)
        curruser?.saveInBackground()
        print("added")
    }
}

