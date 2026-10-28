// Optional macOS helper for the original static social-sharing image.
// Uses offscreen drawing only; no application windows or browser automation.
import AppKit
let width = 1200, height = 630
let image = NSImage(size: NSSize(width: width, height: height))
func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255,
            green: CGFloat((hex >> 8) & 255) / 255,
            blue: CGFloat(hex & 255) / 255, alpha: alpha)
}
func text(_ s: String, _ x: CGFloat, _ y: CGFloat, _ size: CGFloat, _ font: String, _ c: UInt32) {
    (s as NSString).draw(at: NSPoint(x: x, y: y), withAttributes: [
        .font: NSFont(name: font, size: size) ?? NSFont.systemFont(ofSize: size),
        .foregroundColor: color(c)
    ])
}
func stroke(_ points: [NSPoint], _ c: UInt32, _ weight: CGFloat) {
    let path = NSBezierPath(); path.lineWidth = weight
    if let first = points.first { path.move(to: first) }
    for p in points.dropFirst() { path.line(to: p) }
    color(c).setStroke(); path.stroke()
}
image.lockFocus()
color(0xf8f9f5).setFill(); NSRect(x: 0, y: 0, width: width, height: height).fill()
text("MICROBIAL / VISUALIZATION ATLAS", 65, 540, 15, "HelveticaNeue-Medium", 0x184d43)
text("Small worlds.", 62, 366, 83, "Georgia", 0x203b34)
text("Clearer stories.", 62, 273, 83, "Georgia-Italic", 0x184d43)
text("A field guide to environmental", 66, 215, 21, "HelveticaNeue", 0x74816c)
text("microbiology visualization.", 66, 182, 21, "HelveticaNeue", 0x74816c)
text("116 visual recipes     /     16 research themes", 66, 92, 14, "HelveticaNeue", 0x74816c)
stroke([NSPoint(x: 65, y: 66), NSPoint(x: 1135, y: 66)], 0xdce3d9, 1)
let palette: [UInt32] = [0x537b62,0x91a481,0xc99a73,0x6e939b,0xb8c6aa]
let cx: CGFloat = 895, cy: CGFloat = 355
for i in 0..<32 {
    let a = CGFloat(i) / 32 * 2 * .pi
    let parent = CGFloat(i / 4) / 8 * 2 * .pi + .pi / 8
    let p1 = NSPoint(x: cx + 60 * cos(parent), y: cy + 60 * sin(parent))
    let p2 = NSPoint(x: cx + 100 * cos(a), y: cy + 100 * sin(a))
    let p3 = NSPoint(x: cx + 133 * cos(a), y: cy + 133 * sin(a))
    stroke([NSPoint(x:cx,y:cy),p1,p2,p3],palette[i/7 % 5],1.5)
    color(palette[i/7 % 5]).setFill()
    NSBezierPath(ovalIn: NSRect(x:p3.x-3,y:p3.y-3,width:6,height:6)).fill()
    for ring in 0..<2 {
        let radius:CGFloat = 149 + CGFloat(ring)*14
        color(palette[(i+ring*2)%5],0.8).setStroke()
        let arc=NSBezierPath();arc.lineWidth=8
        arc.appendArc(withCenter:NSPoint(x:cx,y:cy),radius:radius,startAngle:CGFloat(i)*11.25+1,endAngle:CGFloat(i+1)*11.25-1)
        arc.stroke()
    }
}
for row in 0..<5 { for column in 0..<15 {
    color(palette[(row*3+column*2)%5],CGFloat(0.45+Double((row+column)%5)*0.1)).setFill()
    NSRect(x:746+column*20,y:105+row*14,width:17,height:11).fill()
}}
text("ILLUSTRATIVE PREVIEWS · SYNTHETIC DATA", 746, 85, 8, "HelveticaNeue", 0x74816c)
image.unlockFocus()
guard let tiff=image.tiffRepresentation, let bitmap=NSBitmapImageRep(data:tiff), let data=bitmap.representation(using:.png,properties:[:]) else { fatalError("Could not render PNG") }
let output=CommandLine.arguments.count>1 ? CommandLine.arguments[1] : "website/assets/social-card.png"
try data.write(to:URL(fileURLWithPath:output))
print("Created social image: \(output)")
