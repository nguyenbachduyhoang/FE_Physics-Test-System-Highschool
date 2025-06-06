function LayoutContent({ layoutType, content1, content2, content3, content4 }) {
  //layout đơn
  if (layoutType === 1) {
    return (
      <section
        style={{
          width: "auto",
          // height: "calc(100vh - 80px)",
          backgroundColor: "#fff",
          padding: "12px",
          margin: "12px",
          borderRadius: "10px",
          overflowY: "auto",
        }}
      >
        {content1}
      </section>
    );
    //layout trái phải
  } else if (layoutType === 2) {
    return (
      <section
        style={{
          display: "flex",
          gap: "12px",
          backgroundColor: "transparent",
          borderRadius: "10px",
          height: "calc(100vh - 80px)",
        }}
      >
        <section
          className="content1"
          style={{
            flex: 7,
            padding: "12px",
            width: "65%",
            height: "auto",
            backgroundColor: "#fff",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          {content1} {/* Left content */}
        </section>
        <section
          className="content2"
          style={{
            flex: 3,
            width: "35%",
            height: "fit-content",
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          {content2} {/* Right content */}
        </section>
      </section>
    );
    //layout trên dưới
  } else if (layoutType === 3) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: "10px",
          gap: "12px",
          height: "calc(100vh - 80px)",
        }}
      >
        <div
          style={{
            flex: 2,
            backgroundColor: "#fff",
            height: "auto",
            padding: "12px",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          <div className="feature">{/* Thêm xóa lưu ở đây */}</div>
          {content1}
        </div>
        <div
          style={{
            flex: 8,
            backgroundColor: "#fff",
            padding: "12px",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          {content2}
        </div>
      </div>
    );
  } else if (layoutType === 4) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: "10px",
          gap: "12px",
          height: "calc(100vh - 80px)",
        }}
      >
        <div
          style={{
            flex: 7,
            backgroundColor: "#fff",
            height: "auto",
            padding: "12px",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          {content1}
        </div>
        <div
          style={{
            flex: 3,
            backgroundColor: "#fff",
            height: "auto",
            padding: "12px",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          <div className="feature">{/* Thêm xóa lưu ở đây */}</div>
          {content2}
        </div>
      </div>
    );
  } else if (layoutType === 5) {
    return (
      <div
        className="layout5"
        style={{
          display: "flex",
          borderRadius: "10px",
          gap: "12px",
          height: "100%",
          minHeight: 0,
        }}
      >
        <div
          className="content1"
          style={{
            flex: 3,
            backgroundColor: "#fff",
            padding: "12px",
            borderRadius: "10px",
            position: "relative",
          }}
        >
          {content1}
        </div>

        <div
          className="content2"
          style={{
            flex: 7,
            backgroundColor: "#fff",
            padding: "12px",
            borderRadius: "10px",
            overflow: "auto",
            maxHeight: "100%",
          }}
        >
          <div className="feature">{/* Thêm xóa lưu ở đây */}</div>
          {content2}
        </div>
      </div>
    );
  } else if (layoutType === 6) {
    return (
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: "transparent",
          borderRadius: "10px",
        }}
      >
        {/* Flex container for content1 and content2 */}
        <section
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          <section
            style={{
              flex: 6.5,
              padding: "12px",
              width: "65%",
              height: "auto",
              backgroundColor: "#fff",
              borderRadius: "10px",
              overflowY: "auto",
            }}
          >
            {content1} {/* Left content */}
          </section>
          <section
            style={{
              flex: 3.5,
              width: "35%",
              height: "fit-content",
              padding: "12px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              overflowY: "auto",
            }}
          >
            {content2} {/* Right content */}
          </section>
        </section>

        {/* Bottom section for content3 */}
        <section
          style={{
            width: "auto",
            height: "auto",
            backgroundColor: "#fff",
            padding: "12px",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          {content3} {/* Bottom content */}
        </section>
        <section
          style={{
            width: "auto",
            height: "auto",
            backgroundColor: "#fff",
            padding: "12px",
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          {content4} {/* Bottom content */}
        </section>
      </section>
    );
  } else if (layoutType === 7) {
    return (
      <section
        style={{
          display: "flex",
          gap: "12px",
          backgroundColor: "transparent",
          borderRadius: "10px",
        }}
      >
        <section
          style={{
            flex: 7,
            width: "70%",
            borderRadius: "10px",
          }}
        >
          <section
            style={{
              width: "100%",
              backgroundColor: "#fff",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #e0e0e0",
            }}
          >
            {content1}
          </section>
          <section
            style={{
              width: "100%",
              backgroundColor: "#fff",
              padding: "12px",
              border: "1px solid #e0e0e0",
              marginTop: "12px",
              borderRadius: "10px",
            }}
          >
            {content2}
          </section>
          <section
            style={{
              width: "100%",
              backgroundColor: "#fff",
              padding: "12px",
              marginTop: "12px",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
            }}
          >
            {content3}
          </section>
        </section>

        <section
          style={{
            flex: 3,
            width: "30%",
            height: "fit-content",
            padding: "12px",
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
            borderRadius: "10px",
          }}
        >
          {content4}
        </section>
      </section>
    );
  } else if (layoutType === 8) {
    return (
      <section>
        <section
          style={{
            width: "100%",
            backgroundColor: "#fff",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          {content1}
        </section>
        <section
          style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "transparent",
            borderRadius: "10px",
          }}
        >
          <section
            style={{
              flex: 7,
              width: "70%",
              borderRadius: "10px",
            }}
          >
            <section
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content2}
            </section>
            <section
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "12px",
                marginTop: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content3}
            </section>
          </section>

          <section
            style={{
              flex: 3,
              width: "30%",
              height: "fit-content",
              padding: "12px",
              border: "1px solid #e0e0e0",
              backgroundColor: "#fff",
              borderRadius: "10px",
            }}
          >
            {content4}
          </section>
        </section>
      </section>
    );
  } else if (layoutType === 9) {
    return (
      <section>
        <section
          style={{
            width: "100%",
            backgroundColor: "#fff",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          {content1}
        </section>
        <section
          style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "transparent",
            borderRadius: "10px",
          }}
        >
          <section
            style={{
              flex: 7,
              width: "70%",
              borderRadius: "10px",
            }}
          >
            <section
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content2}
            </section>
            <section
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "12px",
                marginTop: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content3}
            </section>
          </section>
        </section>
      </section>
    );
  } else if (layoutType === 10) {
    return (
      <section>
        <section
          style={{
            width: "100%",
            backgroundColor: "#fff",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          {content1}
        </section>
        <section
          style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "transparent",
            borderRadius: "10px",
          }}
        >
          <section
            style={{
              width: "100%",
              display: "flex",
              gap: 12,
              borderRadius: "10px",
            }}
          >
            <section
              style={{
                flex: 2,
                width: "20%",
                backgroundColor: "#fff",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content2}
            </section>
            <section
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                flex: 8,
                width: "80%",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content3}
            </section>
          </section>
        </section>
        {content4 && (
          <section
            style={{
              backgroundColor: "#fff",
              padding: "12px",
              marginTop: 12,
              width: "100%",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
            }}
          >
            {content4}
          </section>
        )}
      </section>
    );
  } else if (layoutType === 11) {
    return (
      <section>
        <section
          style={{
            width: "100%",
            backgroundColor: "#fff",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          {content1}
        </section>
        <section
          style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "transparent",
            borderRadius: "10px",
          }}
        >
          <section
            style={{
              width: "100%",
              display: "flex",
              gap: 12,
              borderRadius: "10px",
            }}
          >
            <section
              style={{
                flex: 6.5,
                width: "20%",
                backgroundColor: "#fff",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content2}
            </section>
            <section
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                flex: 3.5,
                width: "80%",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content3}
            </section>
          </section>
        </section>
      </section>
    );
  } else if (layoutType === 12) {
    return (
      <section>
        <section
          style={{
            width: "100%",
            backgroundColor: "#fff",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          {content1}
        </section>
        <section
          style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "transparent",
            borderRadius: "10px",
          }}
        >
          <section
            style={{
              width: "100%",
              display: "flex",
              gap: 12,
              borderRadius: "10px",
            }}
          >
            <section
              style={{
                flex: 5,
                width: "20%",
                backgroundColor: "#fff",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content2}
            </section>
            <section
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                flex: 5,
                width: "80%",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content3}
            </section>
          </section>
        </section>
      </section>
    );
  } else if (layoutType === 13) {
    return (
      <section>
        <section
          style={{
            width: "100%",
            backgroundColor: "#fff",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
          }}
        >
          {content1}
        </section>
        <section
          style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "transparent",
            borderRadius: "10px",
          }}
        >
          <section
            style={{
              width: "100%",
              display: "flex",
              gap: 12,
              borderRadius: "10px",
            }}
          >
            <section
              style={{
                flex: 2,
                width: "30%",
                backgroundColor: "#fff",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content2}
            </section>
            <section
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                flex: 8,
                width: "70%",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
              }}
            >
              {content3}
            </section>
          </section>
        </section>
        {content4 && (
          <section
            style={{
              backgroundColor: "#fff",
              padding: "12px",
              marginTop: 12,
              width: "100%",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
            }}
          >
            {content4}
          </section>
        )}
      </section>
    );
  }

  return null;
}

export default LayoutContent;
