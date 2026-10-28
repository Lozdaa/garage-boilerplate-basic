class SensorAnimatorFaces:
    green = (0, 255, 0)
    yellow = (255, 255, 0)
    blue = (0, 0, 255)
    red = (255, 0, 0)
    white = (255,255,255)
    black = (0,0,0)
    pink = (255,105, 180)
    brown = (150, 75, 0)
    teal = (0, 128, 128)
    
    def __init__(self):
        pass

    def pendant_status_health(self):
        G = self.green
        W = self.white
        
        healthyFrame1 = [
        G, G, G, G, G, G, G, G, 
        G, G, G, G, G, G, G, G, 
        G, G, G, G, G, G, W, G, 
        G, G, G, G, G, W, G, G, 
        G, G, W, G, W, G, G, G, 
        G, G, G, W, G, G, G, G, 
        G, G, G, G, G, G, G, G, 
        G, G, G, G, G, G, G, G
        ]
        
        return [healthyFrame1]
    
    def pendant_status_danger(self):
        R = self.red
        W = self.white
        
        dangerFrame1 = [
        R, R, R, R, R, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, R, R, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, R, R, R, R, R
        ]

        dangerFrame2 = [
        R, R, R, R, R, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, W, W, W, W, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, W, R, R, W, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, W, W, W, W, R, R, 
        R, R, R, R, R, R, R, R
        ]

        dangerFrame3 = [
        R, R, R, R, R, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, W, R, W, W, R, W, R, 
        R, R, R, R, R, R, R, R, 
        R, W, R, W, W, R, W, R, 
        R, R, R, W, W, R, R, R, 
        R, W, R, R, R, R, W, R
        ]

        dangerFrame4 = [
        R, R, R, R, R, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, W, W, R, R, R, 
        R, R, R, W, W, R, R, R, 
        W, R, R, R, R, R, R, W, 
        R, R, R, W, W, R, R, R, 
        W, R, R, W, W, R, R, W, 
        R, R, R, R, R, R, R, R
        ]
        
        return [dangerFrame1, dangerFrame2, dangerFrame3, dangerFrame4]
    
    def pendant_status_manual_help(self):
        Y = self.yellow
        B = self.black
        
        manualHelpFrame1 = [
        Y, Y, Y, Y, Y, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, Y, Y, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, Y, Y, Y, Y, Y
        ]

        manualHelpFrame2 = [
        Y, Y, Y, Y, Y, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, B, B, B, B, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, B, Y, Y, B, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, B, B, B, B, Y, Y, 
        Y, Y, Y, Y, Y, Y, Y, Y
        ]

        manualHelpFrame3 = [
        Y, Y, Y, Y, Y, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, B, Y, B, B, Y, B, Y, 
        Y, Y, Y, Y, Y, Y, Y, Y, 
        Y, B, Y, B, B, Y, B, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, B, Y, Y, Y, Y, B, Y
        ]

        manualHelpFrame4 = [
        Y, Y, Y, Y, Y, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        Y, Y, Y, B, B, Y, Y, Y, 
        B, Y, Y, Y, Y, Y, Y, B, 
        Y, Y, Y, B, B, Y, Y, Y, 
        B, Y, Y, B, B, Y, Y, B, 
        Y, Y, Y, Y, Y, Y, Y, Y
        ]
        
        return [manualHelpFrame1, manualHelpFrame2, manualHelpFrame3, manualHelpFrame4]